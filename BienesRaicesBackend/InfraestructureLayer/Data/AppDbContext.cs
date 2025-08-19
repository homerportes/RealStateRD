using DomainLayerr.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace InfraestructureLayer.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
        public DbSet<Configuration> Configurations { get; set; } = null!;
        public DbSet<Shift> Shifts { get; set; } = null!;
        public DbSet<TimeSlot> TimeSlots { get; set; } = null!;
        public DbSet<Booking> Bookings { get; set; } = null!;


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Configuration>()
                .HasMany(c => c.Shifts)
                .WithOne(s => s.Configuration)
                .HasForeignKey(s => s.ConfigurationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Configuration>()
                .HasMany(c => c.TimeSlots)
                .WithOne(t => t.Configuration)
                .HasForeignKey(t => t.ConfigurationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Shift>()
                .HasMany(s => s.TimeSlots)
                .WithOne(t => t.Shift)
                .HasForeignKey(t => t.ShiftId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TimeSlot>()
                    .HasOne(t => t.Configuration)
                    .WithMany(c => c.TimeSlots)
                    .HasForeignKey(t => t.ConfigurationId)
                    .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TimeSlot>()
                .HasOne(t => t.Shift)
                .WithMany(s => s.TimeSlots)
                .HasForeignKey(t => t.ShiftId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.TimeSlot)
                .WithMany(t => t.Bookings)
                .HasForeignKey(b => b.TimeSlotId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Booking>()
                .HasOne(b => b.User)
                .WithMany(u => u.Bookings)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

    }

    }
