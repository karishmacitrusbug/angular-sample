Welcome to Angular Tracking managment This application provides a simple yet powerful interface for managing tracking, including listing, adding, editing, and viewing parcel details. It also incorporates user authentication with login and signup routes, leveraging for seamless API integration.

## Features

- **Real-Time Location Updates**: Provides live tracking of the item or shipment, allowing users to see its current location on a map..
- **Estimated Delivery/Completion Time**: Gives users an estimated time of arrival (ETA) for deliveries or completion of tasks.
- **Milestone Notifications**: Alerts or updates at key stages (e.g., "Item Shipped", "In Transit", "Out for Delivery", "Delivered").
- **Tracking History**: Allows users to view past tracking data, including the route taken, timestamps for key events, and any delays or issues encountered.
- **Proof of Delivery**: Provides confirmation when an item has been delivered, often including the recipient’s signature or timestamp.

## Technologies Used

- **Angular**: Frontend framework for building the user interface.
- **Angular Router**: Handling routing and navigation within the application.
- **CSS Modules**: Scoped styling for better organization and maintainability.

## Getting Started

To get started with this project, follow these steps:

1. Clone the repository to your local machine:

   ```
   git clone https://github.com/karishmacitrusbug/angular-sample.git
   ```

2. Navigate to the project directory:

   ```
   cd angular-structure
   ```

3. Install dependencies using npm or yarn:

   ```
   npm install
   ```

   or

   ```
   yarn install
   ```

4. Start the development server:

   ```
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200/` to view the app.

# Build

    ```
    ng build --prod
    ```

# Branching Strategy

- Main branch: Stable and production-ready code.
- Development branch: For development and testing new features.
- Feature branches: Create a new branch from development for each feature.
