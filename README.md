# PlaywrightCarsApp

This is a Playwright project for testing the **CarsApp**, a Ruby on Rails application. The tests cover core functionalities such as CRUD operations for cars, linking cars with customers, pagination, and data validation.

**Note:** This project is a work in progress, with ongoing improvements and additional test cases being added.

## Requirements

- **Ruby on Rails** application (refer to the [CarsApp README](https://github.com/miloscole/cars_app#readme) for setup and configuration).
- **Node.js** installed on your system.

## Installation

### 1. Install the Playwright project

1. Clone the project:

    ```bash
    git clone https://github.com/miloscole/playwright_cars_app.git
    cd playwright_cars_app
    ```

2. Install Node.js dependencies:

    ```bash
    npm install
    ```

### 2. Configure the Rails application

For detailed setup and configuration of the **CarsApp** Rails application, please refer to the [README](https://github.com/miloscole/cars_app#readme). The database must be configured to properly run the tests.

## Running the Tests

**Note:** Before running any script, make sure that the path to your CarsApp Rails application is correctly set in the package.json file.

### 1. Reset the Database

Before running the tests, reset the database to start with a clean state:

```bash
npm run reset-db
```
This script resets the cars_app_test database in the Rails application.

### 2. Start the Rails Server

Run the Rails server in test mode:

```bash
npm run start-server
```

### 3. Run All Tests

```bash
npm run e2e
```

### 4. Run Specific Tests

To run specific test suites e.g. Customers grid tests:

```bash
npm run e2e:customers-grid
```

### Project Structure

    tests/: Contains all tests organized by feature (e.g., customers, cars).
    utils/: Utility functions and tools for the tests.

