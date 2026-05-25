import type { RestaurantWithMenu } from "@/lib/restaurants";

export const fallbackRestaurants: RestaurantWithMenu[] = [
  {
    id: "demo-la-esquina",
    name: "La Esquina",
    slug: "la-esquina",
    category: "Pizzas y empanadas",
    phone: "5492324550000",
    isOpen: true,
    scheduleStatus: "unknown",
    scheduleLabel: "Consultar horario",
    scheduleHint: null,
    rating: "4.8",
    cover:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=900&q=80",
    logoUrl: "/restaurants/la-esquina-logo.svg",
    tags: ["Familiar", "Delivery propio", "Mas pedido"],
    city: {
      name: "Suipacha",
      province: "Buenos Aires",
      slug: "suipacha"
    },
    hours: [],
    menu: [
      {
        id: "demo-pizza-muzzarella",
        name: "Pizza muzzarella",
        description: "Salsa de tomate, muzzarella y aceitunas.",
        price: 8500,
        image:
          "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80",
        categoryName: "Pizzas",
        categoryOrder: 1
      },
      {
        id: "demo-empanadas-surtidas",
        name: "Empanadas surtidas",
        description: "Carne, jamon y queso, pollo o verdura.",
        price: 1300,
        image:
          "https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&w=600&q=80",
        categoryName: "Empanadas",
        categoryOrder: 2
      }
    ]
  },
  {
    id: "demo-burger-suipacha",
    name: "Burger Suipacha",
    slug: "burger-suipacha",
    category: "Hamburguesas",
    phone: "5492324550001",
    isOpen: true,
    scheduleStatus: "unknown",
    scheduleLabel: "Consultar horario",
    scheduleHint: null,
    rating: "4.7",
    cover:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=900&q=80",
    logoUrl: "/restaurants/burger-suipacha-logo.svg",
    tags: ["Rapido", "Combos", "Abierto"],
    city: {
      name: "Suipacha",
      province: "Buenos Aires",
      slug: "suipacha"
    },
    hours: [],
    menu: [
      {
        id: "demo-hamburguesa-completa",
        name: "Hamburguesa completa",
        description: "Medallon, queso, lechuga, tomate, huevo y papas.",
        price: 9200,
        image:
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
        categoryName: "Hamburguesas",
        categoryOrder: 1
      },
      {
        id: "demo-papas-cheddar",
        name: "Papas cheddar",
        description: "Papas fritas con cheddar y verdeo.",
        price: 5200,
        image:
          "https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=600&q=80",
        categoryName: "Acompanamientos",
        categoryOrder: 2
      }
    ]
  },
  {
    id: "demo-rotiseria-centro",
    name: "Rotiseria Centro",
    slug: "rotiseria-centro",
    category: "Minutas y platos del dia",
    phone: "5492324550002",
    isOpen: true,
    scheduleStatus: "unknown",
    scheduleLabel: "Consultar horario",
    scheduleHint: null,
    rating: "4.6",
    cover:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    logoUrl: "/restaurants/rotiseria-centro-logo.svg",
    tags: ["Casero", "Retiro", "Menu del dia"],
    city: {
      name: "Suipacha",
      province: "Buenos Aires",
      slug: "suipacha"
    },
    hours: [],
    menu: [
      {
        id: "demo-milanesa-papas",
        name: "Milanesa con papas",
        description: "Milanesa de carne o pollo con guarnicion.",
        price: 8900,
        image:
          "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&w=600&q=80",
        categoryName: "Minutas",
        categoryOrder: 1
      },
      {
        id: "demo-tarta-individual",
        name: "Tarta individual",
        description: "Opciones segun disponibilidad del dia.",
        price: 4700,
        image:
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
        categoryName: "Platos del dia",
        categoryOrder: 2
      }
    ]
  }
];
