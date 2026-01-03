# 📞 Status de Chamadas de Voz e Vídeo

## ❌ Situação Atual

**Atualmente, NÃO há suporte real para chamadas de voz e vídeo no projeto.**

O que foi implementado:
- ✅ Interface visual (diálogo de chamada)
- ✅ Botões de telefone e vídeo no header do chat
- ✅ Animações e feedback visual
- ❌ **NÃO há funcionalidade real de chamadas**

## 🔍 O que o Projeto TEM

### Supabase Realtime
- ✅ Configurado e funcionando
- ⚠️ **Limitação**: Apenas para mudanças no banco de dados (postgres_changes)
- ❌ **NÃO suporta**: Streaming de áudio/vídeo, WebRTC, chamadas P2P

### Infraestrutura Existente
- ✅ Supabase (banco de dados, auth, storage)
- ✅ React + TypeScript
- ✅ WebSocket mencionado (mas não implementado)
- ❌ **NÃO tem**: WebRTC, bibliotecas de chamadas, servidor de sinalização

## 🚀 O que seria NECESSÁRIO para Implementar Chamadas Reais

### Opção 1: WebRTC Nativo (Mais Complexo)

#### 1.1 Bibliotecas Necessárias
```bash
npm install simple-peer
# ou
npm install peerjs
# ou
npm install @livekit/client
```

#### 1.2 Servidor de Sinalização
- **WebSocket Server** (Node.js + Socket.io ou ws)
- **STUN/TURN Servers** (para NAT traversal)
  - Serviços gratuitos: Google STUN, Twilio STUN
  - Serviços pagos: Twilio TURN, AWS Kinesis Video Streams

#### 1.3 Implementação
```typescript
// Exemplo básico com simple-peer
import Peer from 'simple-peer';

// Criar peer
const peer = new Peer({
  initiator: true,
  trickle: false,
  stream: localStream
});

// Sinalização via WebSocket
peer.on('signal', (data) => {
  // Enviar para o outro usuário via WebSocket
  socket.emit('signal', data);
});

// Receber sinalização
socket.on('signal', (data) => {
  peer.signal(data);
});

// Receber stream remoto
peer.on('stream', (remoteStream) => {
  // Exibir vídeo remoto
  videoElement.srcObject = remoteStream;
});
```

#### 1.4 Arquitetura Necessária
```
Frontend (React)
    ↓
WebSocket Client (sinalização)
    ↓
WebRTC Peer Connection
    ↓
STUN/TURN Servers
    ↓
Peer-to-Peer Connection
```

### Opção 2: Serviço SaaS (Mais Simples)

#### 2.1 Twilio Video
- ✅ API completa de chamadas
- ✅ Servidor de sinalização incluído
- ✅ STUN/TURN incluído
- ✅ Suporte a grupos
- 💰 **Custo**: ~$0.004/minuto por participante

```bash
npm install twilio-video
```

```typescript
import { connect } from 'twilio-video';

const room = await connect(token, {
  name: 'room-name',
  audio: true,
  video: true
});

room.on('participantConnected', (participant) => {
  // Adicionar vídeo do participante
});
```

#### 2.2 Agora.io
- ✅ SDK completo
- ✅ Suporte a até 17 participantes (gratuito)
- ✅ Gravação de chamadas
- 💰 **Custo**: Plano gratuito disponível

```bash
npm install agora-rtc-sdk-ng
```

#### 2.3 Daily.co
- ✅ API simples
- ✅ Suporte a até 50 participantes (gratuito)
- ✅ Gravação e transmissão
- 💰 **Custo**: Plano gratuito disponível

```bash
npm install @daily-co/daily-js
```

#### 2.4 LiveKit
- ✅ Open-source
- ✅ Self-hosted ou cloud
- ✅ Suporte completo a WebRTC
- 💰 **Custo**: Gratuito (self-hosted) ou pago (cloud)

```bash
npm install livekit-client
```

## 📋 Checklist de Implementação

### Para WebRTC Nativo:
- [ ] Instalar biblioteca WebRTC (simple-peer, peerjs, etc.)
- [ ] Criar servidor WebSocket para sinalização
- [ ] Configurar STUN/TURN servers
- [ ] Implementar captura de mídia (getUserMedia)
- [ ] Implementar conexão peer-to-peer
- [ ] Gerenciar estado da chamada (conectando, conectado, desconectado)
- [ ] Implementar controles (mute, desligar, etc.)
- [ ] Tratar erros de conexão
- [ ] Implementar notificações de chamada
- [ ] Testar em diferentes navegadores
- [ ] Testar com NAT/firewall

### Para Serviço SaaS:
- [ ] Escolher serviço (Twilio, Agora, Daily, LiveKit)
- [ ] Criar conta e obter API keys
- [ ] Instalar SDK do serviço
- [ ] Implementar autenticação (tokens)
- [ ] Implementar UI de chamada
- [ ] Integrar com sistema de chat existente
- [ ] Implementar notificações de chamada
- [ ] Testar chamadas 1-1 e em grupo

## 🎯 Recomendação

### Para MVP/Rápido:
**Usar Daily.co ou Agora.io**
- Implementação mais rápida
- Menos complexidade
- Suporte a grupos incluído
- Plano gratuito disponível

### Para Produção/Controle Total:
**WebRTC Nativo + LiveKit**
- Mais controle
- Custo menor em escala
- Mais complexo de implementar

## 🔗 Integração com Sistema Atual

### Modificações Necessárias no ChatWindow.tsx

```typescript
// Adicionar estados
const [localStream, setLocalStream] = useState<MediaStream | null>(null);
const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
const [isInCall, setIsInCall] = useState(false);
const [callStatus, setCallStatus] = useState<'idle' | 'connecting' | 'connected' | 'ended'>('idle');

// Função para iniciar chamada real
const handleStartCall = async () => {
  try {
    // 1. Solicitar permissão de mídia
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === 'video'
    });
    
    setLocalStream(stream);
    setIsCalling(true);
    
    // 2. Conectar ao serviço de chamadas
    // (Twilio, Agora, Daily, etc.)
    
    // 3. Atualizar UI
    setIsInCall(true);
    setCallStatus('connecting');
    
  } catch (error) {
    toast({
      title: "Erro ao iniciar chamada",
      description: "Não foi possível acessar câmera/microfone",
      variant: "destructive"
    });
  }
};
```

## 📊 Comparação de Serviços

| Serviço | Custo | Facilidade | Features | Recomendação |
|---------|-------|------------|----------|-------------|
| **Daily.co** | Gratuito até 50 users | ⭐⭐⭐⭐⭐ | Gravação, Screen Share | ✅ Melhor para começar |
| **Agora.io** | Gratuito até 17 users | ⭐⭐⭐⭐ | Gravação, Analytics | ✅ Boa opção |
| **Twilio Video** | $0.004/min/user | ⭐⭐⭐ | Enterprise features | ⚠️ Caro em escala |
| **LiveKit** | Gratuito (self-host) | ⭐⭐⭐ | Open-source, flexível | ✅ Melhor controle |
| **WebRTC Nativo** | Gratuito | ⭐⭐ | Controle total | ⚠️ Muito complexo |

## 🚦 Próximos Passos

1. **Decidir abordagem**: SaaS ou WebRTC nativo?
2. **Escolher serviço** (se SaaS): Daily.co recomendado
3. **Criar conta** e obter API keys
4. **Implementar captura de mídia** (getUserMedia)
5. **Integrar SDK** do serviço escolhido
6. **Atualizar ChatWindow.tsx** com funcionalidade real
7. **Testar** em diferentes navegadores
8. **Implementar notificações** de chamada recebida

## 📝 Notas Importantes

- ⚠️ **HTTPS obrigatório**: getUserMedia requer HTTPS (exceto localhost)
- ⚠️ **Permissões do navegador**: Usuário precisa permitir câmera/microfone
- ⚠️ **Firewall/NAT**: Pode precisar de TURN servers para alguns casos
- ⚠️ **Bateria**: Chamadas de vídeo consomem muita bateria
- ⚠️ **Largura de banda**: Vídeo requer boa conexão

## 🔐 Segurança

- ✅ Sempre usar HTTPS
- ✅ Validar tokens de autenticação
- ✅ Implementar rate limiting
- ✅ Criptografar streams (DTLS no WebRTC)
- ✅ Validar permissões de usuário
