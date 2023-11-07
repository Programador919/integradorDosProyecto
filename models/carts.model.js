import mongoose from "mongoose"

const cartsCollection = "carts";

const cartsSchema = new mongoose.Schema({ 
    products: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId, // Cambiamos el tipo a ObjectId
            ref: 'products', // Referencia al modelo 'productsModel'
          },
          quantity: Number,
        },
      ],
})

export const cartsModel = mongoose.model(cartsCollection, cartsSchema)