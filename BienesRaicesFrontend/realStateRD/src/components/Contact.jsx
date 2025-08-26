import React from "react";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";

const Contact = () => {
  const [result, setResult] = React.useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "7c213568-da20-4f7c-86f7-45dc65fcef5b");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("");
      toast.success("Mensaje enviado exitosamente!");
      event.target.reset();
    } else {
      console.log("Error", data);
      toast.error("Error al enviar el mensaje. Por favor, intenta de nuevo.");
      setResult("");
    }
  };

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

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    focus: {
      scale: 1.02,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    idle: {
      scale: 1,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    },
    tap: {
      scale: 0.95
    }
  };

  return (
    <Motion.div
      className="text-center p-6 py-20 lg:px-32 w-full overflow-hidden"
      id="Contact"
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
            Contacta{" "}
        <Motion.span 
          className="underline underline-offset-4 decoration-1 decoration-gray-800 font-light"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ transformOrigin: "left" }}
        >
          Con nosotros
        </Motion.span>
      </Motion.h1>
      
      <Motion.p 
        className="text-center text-gray-500 mb-12 max-w-80 mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true }}
      >
        Listo para hacer tus sueños de bienes raíces realidad? Contáctanos
        hoy!
      </Motion.p>

      {/* Formulario animado */}
      <Motion.form 
        onSubmit={onSubmit} 
        className="max-w-2xl mx-auto text-gray-600 pt-8"
        variants={formVariants}
      >   
        <Motion.div 
          className="flex flex-wrap"
          variants={inputVariants}
        >
          {/* Campo Nombre */}
          <Motion.div 
            className="w-full md:w-1/2 text-left"
            variants={inputVariants}
          >
            <Motion.label
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Nombre
            </Motion.label>
            <Motion.input
              className="w-full border border-gray-300 rounded py-3 px-4 mt-2"
              type="text"
              name="Name"
              placeholder="Tu Nombre"
              required
              whileFocus="focus"
              variants={inputVariants}
              whileHover={{ 
                borderColor: "#3B82F6",
                transition: { duration: 0.2 }
              }}
            />
          </Motion.div>
          
          {/* Campo Email */}
          <Motion.div 
            className="w-full md:w-1/2 text-left md:pl-4"
            variants={inputVariants}
          >
            <Motion.label
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
            Tu Email
            </Motion.label>
            <Motion.input
              className="w-full border border-gray-300 rounded py-3 px-4 mt-2"
              type="email"
              name="Email"
              placeholder="Tu Email"
              required
              whileFocus="focus"
              variants={inputVariants}
              whileHover={{ 
                borderColor: "#3B82F6",
                transition: { duration: 0.2 }
              }}
            />
          </Motion.div>
        </Motion.div>
        
        {/* Campo Mensaje */}
        <Motion.div 
          className="my-6 text-left"
          variants={inputVariants}
        >
          <Motion.label
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            Mensaje
          </Motion.label>
          <Motion.textarea
            className="w-full border border-gray-300 rounded py-3 px-4 mt-2 h-48 resize-none"
            name="Message"
            placeholder="Mensaje"
            required
            whileFocus="focus"
            variants={inputVariants}
            whileHover={{ 
              borderColor: "#3B82F6",
              transition: { duration: 0.2 }
            }}
          />
        </Motion.div>
        
        {/* Botón de envío */}
        <Motion.button 
          className="bg-blue-600 text-white py-2 px-12 mb-10 rounded"
          variants={buttonVariants}
          initial="idle"
          whileHover="hover"
          whileTap="tap"
          disabled={result === "Sending...."}
        >
          <Motion.span
            animate={result === "Sending...." ? {
              opacity: [1, 0.5, 1],
              transition: { repeat: Infinity, duration: 1 }
            } : {}}
          >
            {result ? result : "Enviar Mensaje"}
          </Motion.span>
        </Motion.button>
      </Motion.form>
    </Motion.div>
  );
};

export default Contact;