const express = require('express');
const fileupload = require('express-fileupload');
const helmet = require('helmet');
const config = require('./config');
const { ProjectRoutes, UserRoutes, SectionsRoutes, TaskRoutes } = require('./api-routes');
const loaders = require('./loaders');
const events = require('./scripts/events')
const path = require("path");
const errorHandler = require('./middlewares/errorHandler');


config();
loaders();
events();

const app = express();

app.use("/uploads", express.static(path.join(__dirname, "./", "uploads")));
app.use(express.json());
app.use(helmet());
app.use(fileupload());


app.listen(process.env.APP_PORT, () => {
    console.log(`Server running on port ${process.env.APP_PORT}`);
    app.use("/projects", ProjectRoutes);
    app.use("/users", UserRoutes);
    app.use("/sections", SectionsRoutes);
    app.use("/tasks", TaskRoutes);

    app.use((req, res, next) => {
        const error = new Error("are you lost?");
        error.status = 404;
        next(error);
    });

    //! Error Handler
    app.use(errorHandler);

});