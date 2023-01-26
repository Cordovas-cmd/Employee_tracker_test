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
  let sql = `
    SELECT
      role.id,
      title,
      department.name,
      salary
    FROM role
    LEFT JOIN department
      ON role.department_id=department.id
  ;`;

  db.query(sql, (err, results) => {
    if (err) throw err;

    console.log("\n");
    console.table(results);
    promptUser();
  });
}

// viewDepts function will display a table of all the departments
function viewDepts() {
  let sql = `
  SELECT
    id,
    name
  FROM department
;`;

  db.query(sql, (err, results) => {
    if (err) throw err;

    console.log("\n");
    console.table(results);

    promptUser();
  });
}

function viewEmployees() {
  let sql = `
    SELECT
      employee.id,
      employee.first_name,
      employee.last_name,
      CONCAT(manager.first_name, " ",manager.last_name) AS "manager",
      role.title,
      role.salary,
      department.name AS "department"
    FROM employee
    LEFT JOIN role 
        ON employee.role_id=role.id
    LEFT JOIN department
      ON role.department_id=department.id
    LEFT JOIN employee manager
      ON manager.id=employee.manager_id
  ;`;

  db.query(sql, (err, results) => {
    if (err) throw err;

    console.log("\n");
    console.table(results);
    promptUser();
  });
}

// add addDept function will take in userInput to add a department
// to the department table
function addDept() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the Department you want to add?",
        name: "addNewDept",
      },
    ])
    .then(function (data) {
      let typedInput = [data.addNewDept];

      // sql statement for adding to department (?) is a placeholder
      let sql = `
    INSERT INTO department(name)
        VALUES(?)`;

      db.query(sql, typedInput, (err) => {
        if (err) throw err;

        console.log(`Added ${typedInput} as a new department!`);

        promptUser();
      });
    });
}
// addRole function will take in userInput about an employee, their salary and the role they want to add to the role table
function addRole() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the name of the role you would like to add?",
        name: "addNewRole",
      },
      {
        type: "input",
        message: "In USD what is the salary for this role?",
        name: "addSalaryToRole",
      },
    ])
    .then(function (data) {
      let typedInputs = [data.addNewRole, data.addSalaryToRole];
      // sql to list departments for user to choose
      let sql = `
        SELECT
        id,
        name
        FROM department
        `;
      db.query(sql, (err, results) => {
        if (err) throw err;
        // listDepts results from sql query to present list of depts to user
        let listDepts = results.map(({ id, name }) => ({
          name: name,
          value: id,
        }));

        inquirer
          .prompt([
            {
              type: "list",
              message: "In what department do you want to add this role?",
              name: "addRoleToDept",
              choices: listDepts,
            },
          ])
          .then(function (data) {
            let deptInfo = data.addRoleToDept;
            typedInputs.push(deptInfo);

            let sql = `
                INSERT INTO role(
                    title,
                    salary, 
                    department_id)
                VALUES(?,?,?)
                    `;

            db.query(sql, typedInputs, (err) => {
              if (err) throw err;

              console.log("Role added!");

              promptUser();
            });
          });
      });
    });
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
