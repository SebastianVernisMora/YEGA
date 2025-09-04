# Project Overview

This project is a Node.js backend for an e-commerce platform. It uses the Express.js framework and MongoDB with Mongoose for the database. The backend provides RESTful APIs for managing products and users, including user registration and login with JWT-based authentication.

## Main Technologies

*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **MongoDB:** NoSQL database.
*   **Mongoose:** ODM library for MongoDB and Node.js.
*   **JSON Web Tokens (JWT):** For user authentication.
*   **Bcrypt:** For password hashing.

## Architecture

The project follows a standard Model-View-Controller (MVC) like architecture, with:

*   **`models/`:** Contains the Mongoose schemas and models for the database collections (e.g., `Producto.js`).
*   **`routes/`:** Defines the API endpoints and their corresponding logic (e.g., `productosList.js`, `usuariosLogin.js`).

There is also a script `generate-backend.js` that seems to be a helper tool to generate code for the project, possibly by using an AI model.

# Building and Running

The project does not have a `package.json` file, so the exact commands for building and running the project are not explicitly defined. However, based on the file contents, the following commands are likely to be used:

**Installation:**

```bash
# TODO: Create a package.json file and add dependencies.
npm install express mongoose jsonwebtoken bcrypt
```

**Running the application:**

```bash
# TODO: Create a main server file (e.g., index.js or app.js)
node index.js
```

# Development Conventions

*   **Authentication:** User authentication is handled using JWT. Passwords are hashed using bcrypt before being stored in the database.
*   **API Design:** The API is designed to be RESTful. For example, `GET /productos` retrieves a list of products, and `POST /usuarios/login` is used for user login.
*   **Code Generation:** The project includes scripts for code generation (`generate-backend.js`, `generate-endpoint.js`), which suggests a convention of using these tools to scaffold new features.
