<img width="467" alt="Logo dark mode" src="https://github.com/user-attachments/assets/169be40e-8e44-41ee-be43-e73022479cd7" />

# Arkstorm - Monitoramento de Apagões por Clima

- Julia Marques (RM98680)
- Guilherme Morais (RM551981)
- Matheus Gusmão (RM550826)

> **Aplicativo móvel para registro e monitoramento de eventos de falta de energia causados por desastres naturais**

Arkstorm é um aplicativo React Native que permite aos usuários registrar, visualizar e analisar eventos de interrupção de energia elétrica causados por fenômenos climáticos como chuvas intensas, ventos fortes e deslizamentos.

## ✨ Funcionalidades

### 🎯 **Principais Recursos**
- 📍 **Registro de Localizações** - Cadastre áreas afetadas com mapa interativo
- ⏱️ **Controle de Duração** - Monitore tempo de interrupção com validação inteligente
- 💰 **Análise de Prejuízos** - Documente danos com templates categorizados
- 📊 **Panorama Geral** - Dashboard com insights automáticos e gráficos
- 📋 **Recomendações** - Guia completo de preparação para emergências

### 🧠 **Recursos Inteligentes**
- **Auto-preenchimento** baseado no histórico de eventos
- **Sugestões contextuais** para descrição de prejuízos
- **Análise de tendências** automática
- **Filtros avançados** por período e categoria

### 📊 **Visualizações e Análises**
- Gráficos de linha para análise temporal
- Gráficos de pizza para distribuição de severidade
- Estatísticas consolidadas por localização
- Métricas de impacto e duração
- Identificação de áreas mais afetadas

## 🛠️ Tecnologias Utilizadas

### **Core**
- [React Native](https://reactnative.dev/) - Framework principal
- [Expo](https://expo.dev/) - Plataforma de desenvolvimento
- [TypeScript](https://www.typescriptlang.org/) - Tipagem estática
- [Expo Router](https://docs.expo.dev/router/introduction/) - Navegação em tabs

### **Armazenamento**
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) - Persistência local de dados

### **Interface e UX**
- [Lucide React Native](https://lucide.dev/) - Biblioteca de ícones
- [React Native Chart Kit](https://github.com/indiespirit/react-native-chart-kit) - Gráficos e visualizações
- [React Native Maps](https://github.com/react-native-maps/react-native-maps) - Mapas interativos

### **Utilitários**
- [date-fns](https://date-fns.org/) - Manipulação de datas
- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/) - Geolocalização
- [React Native UUID](https://github.com/eugenehp/react-native-uuid) - Geração de IDs únicos

## 🚀 Instalação e Configuração

### **Pré-requisitos**
- Node.js 18+ 
- npm ou yarn
- Expo CLI
- iOS Simulator ou Android Emulator

### **1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/arkstorm.git
cd arkstorm
```

### **2. Instale as dependências**
```bash
npm install
# ou
yarn install
```

### **3. Inicie o projeto**
```bash
npx expo start
```

### **4. Execute no dispositivo**
- **iOS**: Pressione `i` no terminal ou escaneie o QR code com o app Expo Go
- **Android**: Pressione `a` no terminal ou escaneie o QR code com o app Expo Go

## 💾 Modelo de Dados

### **Armazenamento Local**
- **Chave**: `@arkstorm:events`
- **Formato**: Array de objetos Event em JSON
- **Persistência**: Totalmente offline via AsyncStorage

## 📊 Funcionalidades por Tela

### **🏠 Panorama Geral**
- Dashboard consolidado com estatísticas
- Gráfico de eventos dos últimos 15 dias
- Gráfico de distribuição por severidade
- Insights automáticos baseados nos dados
- Lista de eventos recentes
- Métricas de performance e tendências

### **📍 Locais Afetados**
- Cadastro com mapa interativo
- Geocoding/Reverse geocoding automático
- Filtros por severidade
- Estatísticas por localização
- Pull-to-refresh para atualizar dados

### **⏱️ Tempo de Interrupção**
- Validação inteligente de formato de duração
- Auto-preenchimento baseado no histórico
- Gráficos de análise temporal
- Categorização automática (curta/média/longa)
- Estimativa de impacto baseada na duração

### **💰 Prejuízos Causados**
- Templates categorizados de prejuízos
- Sugestões inteligentes baseadas no contexto
- Sistema de seleção múltipla
- Filtros por categoria de dano
- Análise de padrões por localização

### **📋 Recomendações**
- Guia completo de preparação para emergências
- Cards expansíveis por categoria
- Sistema de favoritos
- Compartilhamento via redes sociais
- Contatos de emergência atualizados

## 🧪 Recursos Avançados

### **🤖 Automação**
- **Sugestões contextuais** baseadas em severidade, duração e histórico
- **Auto-preenchimento** de campos baseado em eventos anteriores
- **Análise de tendências** automática

### **📱 UX/UI Modernos**
- **Pull-to-refresh** em todas as listas
- **Estados vazios** contextuais e informativos
- **Animações suaves** em transições
- **Feedback visual** em todas as interações
- **Loading states** apropriados

### **🗺️ Geolocalização**
- **Mapas interativos** com seleção de pontos
- **Busca por endereço** com autocomplete
- **Detecção automática** da localização atual
- **Reverse geocoding** para conversão coordenadas → endereço

## 🎯 Casos de Uso

### **Para Cidadãos**
- Registrar eventos de falta de energia em sua região
- Acompanhar histórico pessoal de interrupções
- Preparar-se para emergências com guias práticos
- Compartilhar informações com autoridades

### **Para Gestores Públicos**
- Identificar padrões regionais de interrupção
- Avaliar impacto de eventos climáticos
- Planejar melhorias na infraestrutura
- Gerar relatórios para tomada de decisão

### **Para Concessionárias**
- Coletar dados de campo sobre interrupções
- Identificar áreas críticas da rede
- Avaliar tempo de resposta para reparos
- Melhorar planejamento de manutenção

## 🔜 Roadmap

### **v2.0 - Recursos Sociais**
- [ ] Compartilhamento de eventos entre usuários
- [ ] Sistema de notificações push
- [ ] Mapa colaborativo em tempo real
- [ ] Chat comunitário por região

### **v3.0 - Integração Externa**
- [ ] API de dados meteorológicos
- [ ] Integração com órgãos oficiais
- [ ] Exportação para CSV/PDF
- [ ] Backup em nuvem

### **v4.0 - Analytics Avançado**
- [ ] Machine Learning para previsões
- [ ] Correlação com dados meteorológicos
- [ ] Alertas preditivos
- [ ] Dashboard web administrativo

## 🤝 Contribuindo

Contribuições são sempre bem-vindas! Para contribuir:

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. Abra um **Pull Request**

