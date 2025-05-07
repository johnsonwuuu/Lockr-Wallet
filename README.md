# Lockr Wallet

A secure and user-friendly cryptocurrency wallet built with Next.js, featuring real-time price tracking, transaction management, and robust security features.

## Features

- 🔐 Secure wallet creation and management
- 💰 Real-time cryptocurrency price tracking
- 📊 Transaction history and management
- 🔑 Private key encryption and secure storage
- 🌐 Support for multiple cryptocurrencies
- 📱 Responsive design for desktop and mobile
- 🔄 Real-time price updates
- 🛡️ Advanced security measures

## Tech Stack

- **Frontend Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Data Storage**: Local Storage with encryption
- **Price Data**: CoinGecko API
- **Security**: Web3 libraries, encryption utilities

## Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/johnsonwuuu/Lockr-Wallet.git
   cd Lockr-Wallet
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory and add necessary environment variables:
   ```env
   NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

1. **Create a New Wallet**
   - Click on "Create New Wallet"
   - Follow the security prompts
   - Safely store your recovery phrase

2. **Import Existing Wallet**
   - Click on "Import Wallet"
   - Enter your recovery phrase
   - Follow the verification steps

3. **Managing Your Wallet**
   - View your balance and portfolio
   - Send and receive cryptocurrencies
   - Track transaction history
   - Monitor real-time prices

## Security Features

- Client-side encryption of private keys
- Secure storage of sensitive data
- No private keys stored on servers
- Session timeout for security
- Optional 2FA support

## Development

To contribute to the project:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Disclaimer

This wallet is provided as-is. Users are responsible for their own private keys and funds. Always backup your recovery phrase and private keys in a secure location.
