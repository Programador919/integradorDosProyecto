import {promises as fs} from 'fs'
import {nanoid} from "nanoid"
import { productsModel } from '../models/products.model.js'

class ProductManager extends productsModel
{
    constructor() {
        super();
    }
    
      // Agrega un nuevo producto
      async addProduct(productData) 
      {
          try 
          {
            await productsModel.create(productData);
            return 'Producto agregado';
          } catch (error) {
            console.error('Error al agregar el producto:', error);
            return 'Error al agregar el producto';
          }
        }
    
      // Actualiza un producto existente
      async updateProduct(id, productData) 
      {
        try 
        {
          const product = await ProductManager.findById(id);   
          if (!product) {
            return 'Producto no encontrado';
          } 
          // Actualiza los campos del producto
          product.set(productData);
    
          await product.save();
          return 'Producto actualizado';
        } catch (error) {
          console.error('Error al actualizar el producto:', error);
          return 'Error al actualizar el producto';
        }
      }
    
      // Obtiene todos los productos
      async getProducts() 
      {
        try 
        {
          const products = await ProductManager.find({});
          return products;
        } catch (error) {
          console.error('Error al obtener los productos:', error);
          return [];
        }
      }
    
      // Obtiene un producto por ID
      async getProductById(id) 
      {
        try 
        {
          //La propiedad lean() arregla el error own properties que se muestra al momento de querer mostrar datos desde mongoose, ya que,
          //viene con propiedades propias de mongoose y lean() se las quita para quedar solo el json
          const product = await ProductManager.findById(id).lean();    
          if (!product) 
          {
            return 'Producto no encontrado';
          }   
          return product;
        } catch (error) {
          console.error('Error al obtener el producto:', error);
          return 'Error al obtener el producto';
        }
      }

      // Obtiene un producto por Limit
      async getProductsByLimit(limit) 
      {
        try 
        {
          const products = await ProductManager.find().limit(limit); // Aplica el límite a la consulta
          if (products.length < limit) {
            // Si es menor, ajusta el límite para que coincida con el número de productos disponibles
            limit = products.length;
          }     
          return products;
        } catch (error) {
          throw error;
        }
      }
      // Obtiene un producto por Page
      async getProductsByPage(page, productsPerPage) 
      {
        if (page <= 0) {
          page = 1; // Establece la página predeterminada en 1 si el número de página es menor o igual a 0
        }
        try {
          const products = await ProductManager.find()
            .skip((page - 1) * productsPerPage) // Omite los productos de las páginas anteriores
            .limit(productsPerPage); // Limita la consulta a la cantidad de productos por página
          return products;
        } catch (error) {
          throw error;
        }
      }
      // Obtiene un producto por Query
      async getProductsByQuery(query) 
      {
        try 
        {
          const products = await productsModel.find({
            description: { $regex: query, $options: 'i' }
          });
          return products;
        } catch (error) {
          throw error;
        }
      }

      // Obtiene un producto por Sort
      async getProductsBySort(sortOrder) 
      {
        try 
        {
          const products = await productsModel
          .find({})
          .sort({ price: sortOrder }); // Ordena por precio según el sortOrder
      
          return products;
        } catch (error) {
          throw error;
        }
      }

      //Busqueda con todo lo solicitado 
      async getProductsMaster(page = 1, limit = 10, category, availability, sortOrder) 
      {
        try
        {
          // Construye un objeto de filtro basado en los parámetros de consulta
          let filter = {};
          // Calcula el índice de inicio y fin para la paginación
          const startIndex = (page - 1) * limit;
          const endIndex = page * limit;

          const sortOptions = {};
          
          if (sortOrder === 'asc') {
            sortOptions.price = 1; // Ordenar ascendentemente por precio
          } else if (sortOrder === 'desc') {
            sortOptions.price = -1; // Ordenar descendente por precio
          } else {
            throw new Error('El parámetro sortOrder debe ser "asc" o "desc".');
          }

          if (category != "") {
            filter.category = category;
          }
          if (availability != "") {
            filter.availability = availability;
          }

          // Realiza la consulta utilizando el filtro y la paginación
          const query = ProductManager.find(filter)
            .skip(startIndex)
            .limit(limit)
            .sort(sortOptions); ;
          const products = await query.exec();

        // Calcula el total de páginas y otros detalles de paginación
        const totalProducts = await ProductManager.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);
        const hasPrevPage = startIndex > 0;
        const hasNextPage = endIndex < totalProducts;
        const prevLink = hasPrevPage ? `/api/products?page=${page - 1}&limit=${limit}` : null;
        const nextLink = hasNextPage ? `/api/products?page=${page + 1}&limit=${limit}` : null;

        // Devuelve la respuesta con la estructura requerida
        return {
          status: 'success',
          payload: products,
          totalPages: totalPages,
          prevPage: hasPrevPage ? page - 1 : null,
          nextPage: hasNextPage ? page + 1 : null,
          page: page,
          hasPrevPage: hasPrevPage,
          hasNextPage: hasNextPage,
          prevLink: prevLink,
          nextLink: nextLink,
        };
        } catch (error) {
          console.error('Error al obtener los productos:', error);
          // Si se produce un error, devuelve un objeto con status "error" y el mensaje de error en "payload"
          return { status: 'error', payload: 'Error al obtener los productos' };
        }
      }
      
      // Elimina un producto por ID
      async deleteProduct(id) 
      {
        try 
        {
          const product = await ProductManager.findById(id);  
          if (!product) {
            return 'Producto no encontrado';
          }
    
          await product.remove();
          return 'Producto eliminado';
        } catch (error) {
          console.error('Error al eliminar el producto:', error);
          return 'Error al eliminar el producto';
        }
      }
}
export default ProductManager;