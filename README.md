# Titanic Survival Predictor

A web application that predicts the survival probability of Titanic passengers based on various features like passenger class, age, gender, and more.

## Features

- Interactive web interface for making predictions
- Real-time survival probability calculation
- Comparison mode to compare different passenger scenarios
- Responsive design that works on desktop and mobile devices
- Dark/Light theme support

## Prerequisites

- Python 3.8 or higher
- Node.js (for package management)
- pip (Python package manager)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Priyanshujindal/ADS-PROJECT.git
   cd ADS-PROJECT
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

## Running the Application

1. Start both the backend and frontend servers with a single command:
   ```bash
   npm start
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:8000
   ```

## Project Structure

- `server.py` - Backend Flask server with prediction API
- `train_model.py` - Script to train and save the prediction model
- `model.pkl` - Pre-trained model file
- `assets/` - Frontend assets (CSS, JavaScript)
- `templates/` - HTML templates
- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies and scripts

## API Endpoints

- `POST /predict` - Get survival prediction for a single passenger
- `GET /health` - Check if the server is running

## Troubleshooting

If you encounter any issues:

1. Make sure all dependencies are installed
2. Check if port 5002 is available for the backend
3. Check the browser's developer console (F12) for any errors
4. Ensure you've run `npm install` to install all required packages

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Priyanshu Jindal
