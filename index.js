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
        ]
      }
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

// addEmployee function will take in userInput about a new employee and add them to the databse
function addEmployee() {
  inquirer
    .prompt([
      {
        type: "input",
        message: "What is the new employee's first name?",
        name: "newEmplFirstName",
      },
      {
        type: "input",
        message: "What is the new employee's last name?",
        name: "newEmplLastName",
      },
    ])
    // add role
    .then(function (userInput) {
      let data = [userInput.newEmplFirstname, userInput.newEmplLastName];

      // sql query to get roles table
      let sql = `
      SELECT
        id,
        CONCAT(title, ", id: ", id) AS role
      FROM role
      ORDER BY role
      `;

      db.query(sql, (err, results) => {
        if (err) throw err;

        let listRoles = results.map(({ id, role }) => ({
          name: role,
          value: id,
        }));

        inquirer
          .prompt([
            {
              type: "list",
              message: "What is the new employee's role?",
              name: "idForRole",
              choices: listRoles,
            },
          ])

          .then(function (userInput) {
            let idForRole = userInput.idForRole;
            console.log(idForRole);
            data.push(idForRole);

            // sql query to employee list for assigned manager
            let sql = `
              SELECT
                id,
              CONCAT(first_name, " ", last_name, ", id: ", id) AS name
            FROM employee
            ORDER BY name
          `;

            db.query(sql, (err, results) => {
              if (err) throw err;

              let mgrList = results.map(({ id, name }) => ({
                name: name,
                value: id,
              }));

              inquirer
                .prompt([
                  {
                    type: "list",
                    message: "Who is the new employee's manager?",
                    name: "mgrId",
                    choices: mgrList,
                  },
                ])
                .then(function (userInput) {
                  console.log("mrgId");
                  let mgrId = userInput.mgrId;
                  data.push(mgrId);

                  // sql to add new employee to the database
                  let sql = `
                    INSERT INTO employee (
                      first_name,
                      last_name,
                      role_id,
                      manager_id
                    )
                    VALUES(?, ?, ?, ?)
                  `;

                  db.query(sql, data, (err) => {
                    if (err) throw err;

                    console.log(`Added ${data[0]} ${data[1]} to the database!`);
                    promptUser();
                  });
                });
            });
          });
      });
    });
}

// updateEmpManager function will take in userInput about an existing employee and update the manager assigned in the database
function updateEmpManager() {
  // get a list of employees
  let sql = `
    SELECT
      id,
      CONCAT(first_name, " ", last_name, ", id: ", id) AS name
    FROM employees
    ORDER BY name
  `;

  db.query(sql, (err, results) => {
    if (err) throw err;

    let empList = results.map(({ id, name }) => ({
      name: name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          message: "Which Employee's manager do you want to update?",
          name: "employeeId",
          choices: empList,
        },
      ])
      .then(function (userInput) {
        let data = [userInput.employeeId];

        // get a list of employees (managers)
        let sql = `
          SELECT
            id,
            CONCAT(first_name, " ", last_name, ", id: ", id) AS name
          FROM employees
          ORDER BY name
        `;

        db.query(sql, (err, results) => {
          if (err) throw err;

          let mgrList = results.map(({ id, name }) => ({
            name: name,
            value: id,
          }));

          inquirer
            .prompt([
              {
                type: "list",
                message: "Who is the employee's manager?",
                name: "managerId",
                choices: mrgList,
              },
            ])
            .then(function (userInput) {
              let managerId = userInput.managerId;
              data.push(managerId);

              // update the manager for the selected employee
              let sql = `
              UPDATE employees
              SET employees.manager_id = ?
              WHERE employees.id = ?
            `;
              // reverse the array to match the order needed for the UPDATE statement
              db.query(sql, data.reverse(), (err) => {
                if (err) throw err;

                console.log("Updated employee's manager");

                begin();
              });
            });
        });
      });
  });
}

// updateRole function will take in userInput about an existing employee and update them in the database
function updateRole() {
  let sql = `
    SELECT
      id,
      CONCAT(first_name, " ", last_name, ", id: ", id) AS name
    FROM employee
    ORDER BY name
    `;

  db.query(sql, (err, results) => {
    if (err) throw err;

    let empList = results.map(({ id, name }) => ({
      name: name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          message: "Which employee do you want to update?",
          name: "empId",
          choices: empList,
        },
      ])
      .then(function (userInput) {
        let data = [userInput.empId];

        let sql = `
          SELECT
            id,
            CONCAT(title, ",id: ", id) AS role
          FROM role
          ORDER BY role
          `;

        db.query(sql, (err, results) => {
          if (err) throw err;

          let listRoles = results.map(({ id, role }) => ({
            name: role,
            value: id,
          }));

          inquirer
            .prompt([
              {
                type: "list",
                message:
                  "Which role do you want to assign to the chosen employee?",
                name: "roleId",
                choices: listRoles,
              },
            ])
            .then(function (userInput) {
              let roleId = userInput.roleId;
              data.push(roleId);

              /// selected employee is updated in database
              let sql = `
              UPDATE employee
              SET employee.role_id = ?
              WHERE employee.id = ?
              `;

              // mimic the order of the array to update properly
              db.query(sql, data.reverse(), (err) => {
                if (err) throw err;

                console.log("Employee's role Updated!");

                promptUser();
              });
            });
        });
      });
  });
}

function exit() {
  db.end();
}

promptUser();
