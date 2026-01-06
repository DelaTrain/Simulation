# DelaTrain Simulation

DelaTrain Simulation is a comprehensive simulation environment designed to model and analyze the operations of a railway system. This project aims to provide insights into train scheduling, track management, and overall system efficiency through detailed simulations.

## Accessing the Simulation

Simulation is available online at: [DelaTrain Simulation](https://delatrain.github.io/Simulation/)

## Development setup

To set up the development environment for DelaTrain Simulation, follow these steps:

1. **Clone the Repository**:
    ```shell
    git clone git@github.com:DelaTrain/Simulation.git
    cd Simulation
    ```
2. **Install Dependencies**:

    Ensure you have Node.js and pnpm installed. Then, run:

    ```shell
    pnpm install
    ```

    For local development you will need to provide dataset files in the `public/data` folder.

3. **Run the Development Server**:

    Start the development server with:

    ```shell
    pnpm run dev
    ```

    This will launch the simulation locally, and you can access it via your web browser.

4. **Build for Production**:

    To create a production build, execute:

    ```shell
    pnpm run build
    ```

    The output will be in the `dist` directory.
