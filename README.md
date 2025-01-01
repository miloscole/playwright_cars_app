# PlaywrightCarsApp

This is a Playwright project for testing the **CarsApp**, a Ruby on Rails full stack application. Since JSON responses are not provided by the Rails server in this application, the API responses are parsed directly from HTML.

The tests should cover core functionalities of the application, including:

    CRUD operations for cars
    Linking cars with customers
    Pagination
    Data validation

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

**Note:** Before running any script, make sure the Rails application (`CarsApp`) and this Playwright project
are placed in the same parent folder and than navigate to playwright_cars_app with (`cd playwright_cars_app`).

### 1. Run Specific Tests

To run specific test suites e.g. Customers grid tests:

```bash
npm run e2e:customers-grid
```

### Project Structure

    tests/: Contains all tests organized by feature (e.g., customers, cars).
    utils/: Utility functions and tools for the tests.
