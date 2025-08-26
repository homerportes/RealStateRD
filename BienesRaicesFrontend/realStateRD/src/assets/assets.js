import logo from "./logo.png";
import logo_dark from "./logo_dark.svg";
import cross_icon from "./cross_icon.svg";
import menu_icon from "./menu_icon.svg";
import star_icon from "./star_icon.svg";
import left_arrow from "./left_arrow.svg";
import right_arrow from "./right_arrow.svg";
import brand_img from "./brand_img.png";
import project_img_1 from "./project_img_1.jpg";
import project_img_2 from "./project_img_2.jpg";
import project_img_3 from "./project_img_3.jpg";
import project_img_4 from "./project_img_4.jpg";
import project_img_5 from "./project_img_5.jpg";
import project_img_6 from "./project_img_6.jpg";
import profile_img_1 from "./profile_img_1.png";
import profile_img_2 from "./profile_img_2.png";
import profile_img_3 from "./profile_img_3.png";
import about_img from "./about_img.webp";

export const assets = {
  logo,
  logo_dark,
  cross_icon,
  menu_icon,
  star_icon,
  brand_img,
  about_img,
  project_img_1,
  project_img_2,
  project_img_3,
  project_img_4,
  left_arrow,
  right_arrow,
};

export default assets;

export const projectsData = [
  {
    title: "Casa",
    price: "$15,000",
    location: "Distrito Nacional",
    image: project_img_1,
  },
  {
    title: "Casa",
    price: "8,000",
    location: "Bajos de Haina",
    image: project_img_2,
  },
  {
    title: "Casa",
    price: "$4,000",
    location: "MonteCristi",
    image: project_img_3,
  },
  {
    title: "Apartamento",
    price: "$10,000",
    location: "Villa Mella",
    image: project_img_4,
  },
  {
    title: "Casa",
    price: "$2,50,000",
    location: "San Francisco de Macoris",
    image: project_img_5,
  },
  {
    title: "Casa",
    price: "$2,50,000",
    location: "Punta Cana",
    image: project_img_6,
  },
];

export const testimonialsData = [
  {
    name: "Carlos Gómez",
    title: "Empresario",
    image: profile_img_1,
    alt: "Retrato de Carlos Gómez",
    rating: 5,
    text: "Desde la primera reunión entendieron lo que buscaba y me ayudaron a encontrar la propiedad ideal. Su dedicación y atención al detalle superaron mis expectativas.",
  },
  {
    name: "Marío Rodríguez",
    title: "Arquitecto",
    image: profile_img_2,
    alt: "Retrato de María Rodríguez",
    rating: 4,
    text: "Me guiaron en todo el proceso con profesionalidad y transparencia. Gracias a ellos encontré un espacio perfecto para mi proyecto.",
  },
  {
    name: "José Martínez",
    title: "Ingeniero Civil",
    image: profile_img_3,
    alt: "Retrato de José Martínez",
    rating: 5,
    text: "Su compromiso con el cliente y la rapidez para responder a mis necesidades hicieron que comprar mi propiedad fuera una experiencia excelente.",
  },  
];
