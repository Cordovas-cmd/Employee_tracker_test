const inquirer = require("inquirer");
const mysql = require("mysql2");

require("dotenv").config();
require("console.table");

// make connection to the database
const db = mysql.createConnection(
  {
    host: "localhost",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "employee_db",
  },
  console.log("Connected to the database!")
);
// TODO: add user prompts
function promptUser() {
  inquirer.prompt([{}]);
}
