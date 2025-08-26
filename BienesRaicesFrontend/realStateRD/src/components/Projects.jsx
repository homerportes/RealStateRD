import React, { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";
import assets, { projectsData } from "../assets/assets";

const Projects = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(1);

  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth >= 1024) {
        setCardsToShow(projectsData.length);
      } else {
        setCardsToShow(1);
      }
    };
    updateCardsToShow();

    window.addEventListener("resize", updateCardsToShow);
    return () => {
      window.removeEventListener("resize", updateCardsToShow);
    };
  }, []);

  const nextProject = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projectsData.length);
  };

  const prevProject = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? projectsData.length - 1 : prevIndex - 1
    );
  };

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
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
      scale: 1.02,
      y: -5,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.1,
      backgroundColor: "#374151",
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <Motion.div
      className="container mx-auto py-4 pt-20 px-6 md:px-20 lg:px-32 my-20 w-full overflow-hidden"
      id="Projects"
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
        Proyectos{" "}
        <Motion.span 
          className="underline underline-offset-4 decoration-1 under font-light"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ transformOrigin: "left" }}
        >
          Completados
        </Motion.span>
      </Motion.h1>
      
      <Motion.p 
        className="text-center text-gray-500 mb-8 max-w-80 mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
      >
        Creando espacios, construyendo legados – Explora nuestro portafolio
      </Motion.p>

      {/* Botones del slider animados */}
      <Motion.div 
        className="flex justify-end items-center mb-8"
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: true }}
      >
        <Motion.button
          onClick={prevProject}
          className="p-3 bg-gray-200 rounded mr-2"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Previous Project"
        >
          <img src={assets.left_arrow} alt="Previous" />
        </Motion.button>
        <Motion.button
          onClick={nextProject}
          className="p-3 bg-gray-200 rounded mr-2"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          aria-label="Next Project"
        >
          <img src={assets.right_arrow} alt="Next" />
        </Motion.button>
      </Motion.div>

      {/* Projects Slider container */}
      <div className="overflow-hidden">
        <Motion.div
          className="flex gap-8"
          animate={{
            transform: `translateX(-${(currentIndex * 100) / cardsToShow}%)`
          }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
            type: "tween"
          }}
        >
          {projectsData.map((project, index) => (
            <Motion.div
              key={index}
              className="relative flex-shrink-0 w-full sm:w-1/4"
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              whileHover="hover"
              viewport={{ once: true, amount: 0.3 }}
            >
              {/* Imagen con efecto hover */}
              <Motion.div
                className="overflow-hidden mb-14"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
              >
                <Motion.img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-auto"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
              </Motion.div>

              {/* Tarjeta de información con animación */}
              <Motion.div 
                className="absolute left-0 right-0 bottom-5 flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{ y: -5 }}
              >
                <Motion.div 
                  className="inline-block bg-white w-3/4 px-4 py-2 shadow-md"
                  whileHover={{
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Motion.h2 
                    className="text-xl font-semibold text-gray-800"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    {project.title}
                  </Motion.h2>
                  <Motion.p 
                    className="text-gray-500 text-sm"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    {project.price} <span className="px-1"></span> {project.location}
                  </Motion.p>
                </Motion.div>
              </Motion.div>
            </Motion.div>
          ))}
        </Motion.div>
      </div>
    </Motion.div>
  );
};

export default Projects;