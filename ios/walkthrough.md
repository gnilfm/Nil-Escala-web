# Suporte iOS Adicionado (Capacitor)

O seu projeto agora está configurado com o **Capacitor**, permitindo a geração de aplicativos nativos iOS.

A pasta `ios/` foi criada e contém todo o projeto nativo do Xcode, sincronizado com o seu build web (`dist/`).

## Alterações Realizadas

### Arquivos
- **`ios/`**: Pasta contendo o projeto nativo iOS.
- **`capacitor.config.ts`**: Configuração central do Capacitor.
- **`package.json`**: Adicionado o script `build:ios`.

### Comandos
Para atualizar o projeto iOS com suas últimas alterações web:

```bash
npm run build:ios
```

Este comando irá:
1. Reconstruir seu app web (`npm run build`).
2. Copiar os arquivos para a pasta iOS.
3. Atualizar plugins e configurações nativas (`npx cap sync ios`).

## Como gerar o IPA (iOS App Store Package)

Como você está no Windows, não é possível compilar o arquivo `.ipa` final aqui. Você tem duas opções para prosseguir:

### Opção 1: Usar um Mac (Recomendado para testes locais)
1. Copie a pasta do projeto inteira para um computador com macOS.
2. No terminal do Mac, instale as dependências: `npm install`.
3. Abra o projeto no Xcode:
   ```bash
   npx cap open ios
   ```
4. No Xcode:
   - Configure o **Signing & Capabilities** com sua conta de desenvolvedor Apple.
   - Selecione o dispositivo de destino (Ex: "Any iOS Device (arm64)").
   - Vá em **Product > Archive** para gerar o build final.

### Opção 2: Build na Nuvem (CI/CD)
Use serviços que oferecem máquinas macOS na nuvem:
- **Ionic Appflow**: Serviço oficial do time do Capacitor.
- **GitHub Actions**: Use um workflow com `runs-on: macos-latest`.

Exemplo de passo no GitHub Actions para buildar:
```yaml
name: Build iOS (Verify)

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    name: Build iOS App
    runs-on: macos-latest

    steps:
      - name: Checkout source
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm install

      - name: Build Web Assets
        run: npm run build

      - name: Update Capacitor iOS
        run: npx cap sync ios

      - name: Build iOS App (Simulator)
        # Compila para o Simulador para testar se não há erros de código nativo.
        # Isso NÃO requer certificados de assinatura da Apple.
        run: |
          cd ios/App
          xcodebuild -workspace App.xcworkspace -scheme App -destination 'generic/platform=iOS Simulator' build

```
