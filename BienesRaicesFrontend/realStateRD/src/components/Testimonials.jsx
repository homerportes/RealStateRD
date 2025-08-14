import React from "react";
import { motion as Motion } from "framer-motion";
import assets, { testimonialsData } from "../assets/assets";

const Testimonials = () => {
  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      y: -10,
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const imageVariants = {
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        duration: 0.3
      }
    }
  };

  const starVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: (index) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.3,
        type: "spring",
        stiffness: 200
      }
    })
  };

  return (
    <Motion.div
      className="container mx-auto py-10 lg:px-32 w-full overflow-hidden"
      id="Testimonials"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Título animado */}
      <Motion.h1 
        className="text-2xl sm:text-4xl font-bold mb-2 text-center"
        variants={titleVariants}
      >
        Customer
        <Motion.span 
          className="underline underline-offset-4 decoration-1 decoration-gray-800 font-light"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ transformOrigin: "left" }}
        >
          Testimonials
        </Motion.span>
      </Motion.h1>
      
      <Motion.p 
        className="text-center text-gray-500 mb-12 max-w-80 mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
      >
        Real Stories from those Who Found Home with Us
      </Motion.p>

      {/* Contenedor de testimonios */}
      <div className="flex flex-wrap justify-center gap-8">
        {testimonialsData.map((testimonial, index) => (
          <Motion.div
            key={index}
            className="max-w-[340px] border-amber-200 shadow-lg rounded px-8 py-12 text-center"
            variants={cardVariants}
            whileHover="hover"
            custom={index}
          >
            {/* Imagen de perfil animada */}
            <Motion.img
              className="w-20 h-20 rounded-full mx-auto mb-4"
              src={testimonial.image}
              alt={testimonial.alt}
              variants={imageVariants}
              whileHover="hover"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            />
            
            {/* Nombre animado */}
            <Motion.h2 
              className="text-xl text-gray-700 font-medium"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
            >
              {testimonial.name}
            </Motion.h2>
            
            {/* Título/cargo animado */}
            <Motion.p 
              className="text-gray-500 mb-4 text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
            >
              {testimonial.title}
            </Motion.p>
            
            {/* Estrellas animadas */}
            <Motion.div 
              className="flex justify-center gap-1 text-red-500 mb-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
            >
              {Array.from({ length: testimonial.rating }, (item, starIndex) => (
                <Motion.img 
                  key={starIndex} 
                  src={assets.star_icon} 
                  alt=""
                  variants={starVariants}
                  initial="hidden"
                  whileInView="visible"
                  custom={starIndex}
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: 360,
                    transition: { duration: 0.3 }
                  }}
                />
              ))}
            </Motion.div>
            
            {/* Texto del testimonio animado */}
            <Motion.p 
              className="text-gray-600"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.5 }}
            >
              {testimonial.text}
            </Motion.p>
          </Motion.div>
        ))}
      </div>
    </Motion.div>
  );
};

export default Testimonials;