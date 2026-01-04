export const MENU_ITEMS = [
  {
    id: 1,
    name: "Classic Cheese Burger",
    price: 650,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60",
    description: "Beef patty, cheddar cheese, lettuce, house sauce."
  },
  {
    id: 2,
    name: "Double Bacon BBQ",
    price: 950,
    category: "Burgers",
    image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=60",
    description: "Double beef, crispy bacon, BBQ sauce, onion rings."
  },
  {
    id: 3,
    name: "Spicy Chicken Wings",
    price: 550,
    category: "Chicken",
    image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=500&q=60",
    description: "6 pieces tossed in hot buffalo sauce."
  },
  {
    id: 4,
    name: "Loaded Fries",
    price: 400,
    category: "Sides",
    image: "https://images.unsplash.com/photo-1630384060421-a43231273320?auto=format&fit=crop&w=500&q=60",
    description: "Fries topped with melted cheese and bacon bits."
  },
  {
    id: 5,
    name: "Passion Mojito",
    price: 350,
    category: "Drinks",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=60",
    description: "Fresh passion fruit, mint, lime, and soda."
  }
];
// src/data.js
// src/data.js

export const STORIES = [
  {
    id: 1,
    title: "Juicy!",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=60", 
    // CHANGED: Using a standard reliable test video
    video: "/videos/drink.mp4", 
    color: "from-orange-500 to-red-500"
  },
  {
    id: 2,
    title: "Refresh",
    image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=150&q=60",
    video: "/videos/burger.mp4",
    color: "from-green-400 to-emerald-600"
  },
  {
    id: 3,
    title: "Sizzle",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&q=60",
    video: "/videos/fries.mp4",
    color: "from-yellow-400 to-orange-500"
  }
];

export const CATEGORIES = ["All", "Burgers", "Chicken", "Sides", "Drinks"];