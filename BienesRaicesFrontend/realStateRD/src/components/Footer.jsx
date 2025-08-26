import React from "react";
import assets from "../assets/assets";

const Footer = () => {
  return (
    <div
      className="pt-10 px-4 md:px-20 lg:px-32 bg-gray-900 w-full overflow-hidden"
      id="Footer"
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start">
        <div className="w-full md:w-1/3 mb-8 mb:mb-0">
          <img src={assets.logo_dark} alt="" />
          <p className="text-gray-400 mt-4">
          Te ayudamos a encontrar tu hogar ideal con confianza, transparencia y dedicación. Tu camino hacia una mejor vida comienza aquí
          </p>
        </div>
        <div className="w-full md:w-1/5 mb-8 md:mb-0">
          <h3 className="text-white text-lg font-bold mb-4">Company</h3>
          <ul className="flex flex-col gap-2 text-gray-400">
            <a href="#Header" className="hover:text-white">
              Incio
            </a>
            <a href="#About" className="hover:text-white">
              Sobre nosotros
            </a>
            <a href="#Contact" className="hover:text-white">
              Contacto
            </a>
            <a href="#" className="hover:text-white">
              Politica de privacidad
            </a>
          </ul>
        </div>
        <div className="w-full md:w-1/3">
          <h3 className="text-white text-lg font-bold mb-4">
            Suscríbete a nuestro boletín
          </h3>
          <p className="text-gray-400 mb-4 max-w-80">lo mas reciente</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-2 rounded bg-gray-800 text-gray-400 border border-amber-200 focus:outline-none w-full md:w-auto"
            />
            <button className="py-2 px-4 rounded bg-blue-500 text-white">
              Suscríbete
            </button>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 py-4 mt-10 text-center text-gray-500">
        Copyright 2025 - Crafit Spaces, Todos los derechos reservados.
      </div>
    </div>
  );
};

export default Footer;
