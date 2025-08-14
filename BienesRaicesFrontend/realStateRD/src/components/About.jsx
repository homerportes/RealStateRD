import React from "react";
import assets from "../assets/assets";
import { motion as Motion } from "framer-motion";

const About = () => {
  return (
    <div
      id="About"
      className="container mx-auto w-full overflow-hidden flex flex-col items-center justify-center p-14 md:px-20 lg:px-32 scroll-mt-24"
    >
      <Motion.h1
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-2xl sm:text-4xl font-bold mb-2"
      >
        About{" "}
        <span className="underline underline-offset-4 decoration-1 font-light">
          Our Brand
        </span>
      </Motion.h1>

      <Motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        viewport={{ once: true }}
        className="text-gray-500 max-w-md text-center mb-8"
      >
        Passionate About Properties, Dedicated to Your Vision
      </Motion.p>

      <div className="flex flex-col md:flex-row item-center md:items-start md:gap-20">
        <Motion.img
          src={assets.brand_img}
          alt=""
          className="w-full sm:w-1/2 max-w-lg"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        />

        <Motion.div
          className="flex flex-col items-center md:items-start mt-10 text-gray-600"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 gap-6 md:gap-10 w-full 2x1:pr-28">
            {[
              { value: "10+", label: "Years of Excellence" },
              { value: "12+", label: "Projects Completed" },
              { value: "20+", label: "Mn. Sq. Ft. Delivered" },
              { value: "25+", label: "Ongoing Projects" }
            ].map((item, i) => (
              <Motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <p className="text-4xl font-medium text-gray-800">{item.value}</p>
                <p>{item.label}</p>
              </Motion.div>
            ))}
          </div>

          <Motion.p
            className="my-10 max-w-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            viewport={{ once: true }}
          >
            Nuestro compromiso es brindar soluciones inmobiliarias de calidad,
            adaptadas a las necesidades de cada cliente. Desde la búsqueda de la
            propiedad ideal hasta el acompañamiento en todo el proceso de compra
            o venta, trabajamos con dedicación y transparencia para garantizar
            que cada proyecto se convierta en un verdadero hogar o una inversión
            exitosa.
          </Motion.p>

          <Motion.button
            className="bg-blue-600 text-white px-8 py-2 rounded"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            viewport={{ once: true }}
          >
            Learn more
          </Motion.button>
        </Motion.div>
      </div>
    </div>
  );
};

export default About;
