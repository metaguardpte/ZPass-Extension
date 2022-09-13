# ZPass Browser Extension

ZPass is more than a Password Protection and Management tool, it secures all your valuable digital assets in your own vault, including the personal vault and the company vault

## 1. Prerequisites

This project is the browser(Chrome/Edge) extension part of ZPass, it needs to work with the [app part](https://github.com/metaguardpte/ZPassApp) on a live system. You can deploy your own ZPassApp or use our official deliveries (https://www.zpassapp.com/download/).

Verify your development environment has the minimum prerequisite versions of Node and Yarn installed:

-   node >=16 LTS
-   yarn >=1.22.0

## 2. Local development setup

### 2.1 Install dependencies

Under the root directory, run the following to install the dependencies.

```
yarn
```

### 2.2 Run the project and add extensions

Under the root directory, run the following commands to start the project.

```
yarn start
```

Open Chrome/Edge, and go to the extensions tab:

- Chrome: chrome://extensions/
- Edge: edge://extensions/

Click "Load unpacked" button and target to the dist directory under the root directory.

### 2.3 Add the extension ID to the manifest file.

Ensure the Developer mode of the browser is enabled, and then get the extension ID.

Open the manifest file of the native extension client under the ZPass App installation directory and add your dev extension ID
%LocalAppData%\Programs\zpass\resources\ext-native\manifest.json

```
{
    "name": "chromium.extension.zpass",
    "description": "Open the ZPass App",
    "path": ".\\ext-native.exe",
    "loglevel": "warn",
    "type": "stdio",
    "allowed_origins": [
        "chrome-extension://eoioohbhgednnbpdfhpbaejfcafhjmnb/",
        "chrome-extension://gmfbcmpolfoehenbkhagaldpolpgbock/",
        "chrome-extension://<your dev extension ID>/",
    ]
}
```

## 3. Build

### 3.1 Install dependencies

Under the root directory, run the following to install the dependencies.

```
yarn
```

### 3.2 Build project

Under the root directory, run the following to build the project. And get the outputs from dist directory.

```
yarn build
```

## 4. Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for details on the contributing and our code of conduct.

## 5. Versioning

For the versions available, see the [tags on this repository](https://github.com/metaguardpte/ZPass-Extension/tags).

## 6. Releases

For the releases available, see the [releases on this repository](https://github.com/metaguardpte/ZPass-Extension/releases).

## 7. Authors

See the list of [contributors](https://github.com/metaguardpte/ZPass-Extension/graphs/contributors) who participated in this project.

## 8. License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
