require("dotenv").config();
require("console.table");
const inquirer = require("inquirer");
const mysql = require("mysql2");

const db = mysql.createConnection(
  {
    host: "localhost",
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "employee_db",
  },
  console.log("Connected to the database!")
);

function promptUser() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Please select an option from the menu: ",
        name: "options",
        choices: [
          "View All Departments",
          "View All Roles",
          "View All Employees",
          "Add a Department",
          "Add a Role",
          "Add an Employee",
          "Update an Employee Role",
          "Quit",
        ],
      },
    ])
    .then(function (userInput) {
      switch (userInput.options) {
        case "View All Departments":
          viewDepts();
          break;
        case "View All Roles":
          viewRoles();
          break;
        case "View All Employees":
          viewEmployees();
          break;
        case "Add a Department":
          addDept();
          break;
        case "Add a Role":
          addRole();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        case "Update an Employee Role":
          updateRole();
          break;
        default:
          exit();
      }
    });
}

function viewRoles() {
  console.log("i view roles");
  promptUser();
}

function viewDepts() {
  console.log("i view departments");

  promptUser();
}

function viewEmployees() {
  console.log("I view employees ");

  promptUser();
}

function addDept() {
  console.log("I add a department ");

  promptUser();
}

function addRole() {
  console.log("I add a role ");

  promptUser();
}

function addEmployee() {
  console.log("I add an employee ");

  promptUser();
}

function updateRole() {
  console.log("I update a role ");

  promptUser();
}

function exit() {
  db.end();
}

promptUser();
