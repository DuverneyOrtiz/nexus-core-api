import { Server } from "./app.js";

const PORT = process.env.PORT || 4000;
new Server().Listen(PORT, () => console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`))
