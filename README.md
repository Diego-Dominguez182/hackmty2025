# HackMTY_FALCONS

This is a demo Expo app created for the hackathon HackMTY 2025.
The app consist of a generic banking app to show our solution, an AI assistant integrated within any banking app, and a Simple UI mode for accessibility and simplifying the management of your finances. 

## Test the app

Inside the clone folder of the repo:

1. Install dependencies

   ```bash
   npm install && npm install expo
   ```

2. Start the app

   ```bash
   npx expo start
   ```
   
   2.1. In case you need it
      ```bash
      npm install react-native && npm install react
      ```
      
3. Start your proxy server to run the IFA
   ```bash
   cd server && npm install && npm start
   ```

## IMPORTANT
1. Since we were using the Nessieisreal API to simulate bank transactions, once you run the app you'll probably find a 502 HTTP error. This is because the app is tring to retrieve data from an account that is registered in the API. Fortunately, those are just display values, but reduces the visuals of the demo app.
2. The way we implemented the AI model is by using a custom proxy server with js, serving as an intermediate between the API and the app. The app will try to retrieve the response from the server, but since it is inside your own network (because your pc is functioning as a proxy server) the address that uses is hardcoded. For the model to work youll have to change the adress inside index.tsx and setup your .env. (This was one of our struggles ;).
