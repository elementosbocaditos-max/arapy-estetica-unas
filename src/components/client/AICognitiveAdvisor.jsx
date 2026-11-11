import React, { useState } from 'react';
import { Sparkles, Send, X, CheckCircle2, Wand2 } from 'lucide-react';
import { useSaaS } from '../../context/SaaSContext';

export default function AICognitiveAdvisor() {
  const {
    tenantDb,
    activeModal,
    setActiveModal,
    selectServiceAndGoToBooking,
    setSelectedNailShape,
    setAddedInspoIds
  } = useSaaS();

  const { branding, services = [], inspoGallery = [], operations = {} } = tenantDb;
  const currency = operations.currencySymbol || '$';

  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      role: 'assistant',
      text:
        operations.aiGreeting ||
        `¡Hola! Soy la Asesora IA de ${branding.businessName}. ¿Qué te gustaría hacerte hoy: Uñas, Peluquería o ambos?`,
      recommendations: services.slice(0, 2)
    }
  ]);
  const [input, setInput] = useState('');

  if (activeModal !== 'ai') return null;

  const generateSmartResponse = (userText) => {
    const q = userText.toLowerCase();
    const nailServices = services.filter((s) => s.category === 'unas');
    const hairServices = services.filter((s) => s.category === 'pelo');
    const comboServices = services.filter((s) => s.category === 'combos');

    if (
      q.includes('corte') ||
      q.includes('pelo') ||
      q.includes('cabello') ||
      q.includes('color') ||
      q.includes('balayage') ||
      q.includes('peinado') ||
      q.includes('brushing')
    ) {
      const matched = hairServices.length > 0 ? hairServices : services.slice(0, 2);
      return {
        text: `Para tu cabello en ${branding.businessName} te recomiendo estas opciones de nuestro catálogo actual. Si buscás renovar puntas y brillo inmediato elegí Corte & Brushing, o si querés iluminación elegí Coloración & Balayage:`,
        suggestedShape: 'Ondas / Modelado',
        recommendations: matched
      };
    }

    if (
      q.includes('fiesta') ||
      q.includes('evento') ||
      q.includes('combo') ||
      q.includes('ambos') ||
      q.includes('todo')
    ) {
      const matched =
        comboServices.length > 0
          ? [...comboServices, ...(nailServices.slice(0, 1))]
          : services.slice(0, 2);
      return {
        text: `¡Ideal para salir lista en una sola visita! Podemos combinar Uñas + Peluquería. Te pre-selecciono las mejores fotos de inspiración para que tu estilista las tenga listas:`,
        suggestedShape: 'Almendra',
        recommendations: matched
      };
    }

    if (q.includes('kapping') || q.includes('quiebra') || q.includes('natural') || q.includes('corta')) {
      const kapping =
        nailServices.find((s) => s.name.toLowerCase().includes('kapping')) ||
        nailServices[0] ||
        services[0];
      return {
        text: `Si querés proteger el largo de tu uña natural para que no se quiebre y que el esmaltado dure 21 días impecable, el servicio ideal es "${kapping?.name}". Te sugiero formato Almendra o Squoval:`,
        suggestedShape: 'Almendra',
        recommendations: kapping ? [kapping] : services.slice(0, 1)
      };
    }

    // Default: Nails / 3D / Soft Gel
    const matchedNails = nailServices.length > 0 ? nailServices : services.slice(0, 2);
    return {
      text: `Para lucir manos impecables hoy te recomiendo estas opciones de nuestro estudio. Al elegir cualquiera, te cargo automáticamente las fotos de muestra en tu tarjeta "Added Inspo":`,
      suggestedShape: 'Almendra',
      recommendations: matchedNails
    };
  };

  const handleSend = (textToSend) => {
    const finalMsg = (textToSend ?? input).trim();
    if (!finalMsg) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', text: finalMsg };
    const aiReply = generateSmartResponse(finalMsg);
    const botMsg = {
      id: `b-${Date.now() + 1}`,
      role: 'assistant',
      text: aiReply.text,
      suggestedShape: aiReply.suggestedShape,
      recommendations: aiReply.recommendations
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  };

  const handleApplyRecommendation = (srv, suggestedShape) => {
    if (suggestedShape) setSelectedNailShape(suggestedShape);
    // Attach matching inspo photos automatically
    const matchingInspo = inspoGallery
      .filter((i) => i.linkedServiceId === srv.id || i.category === srv.category)
      .map((i) => i.id);
    if (matchingInspo.length > 0) {
      setAddedInspoIds(matchingInspo.slice(0, 3));
    }
    setActiveModal('none');
    selectServiceAndGoToBooking(srv.id, false);
  };

  return (
    <div className="modal-backdrop" onClick={() => setActiveModal('none')}>
      <div className="ai-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="ai-modal-header">
          <div className="ai-header-left">
            <div className="ai-avatar-orb">
              <Wand2 size={18} />
            </div>
            <div>
              <h3>Asesora IA — {branding.businessName}</h3>
              <p>Recomendación inteligente de Uñas & Peluquería en vivo</p>
            </div>
          </div>
          <button
            type="button"
            className="modal-close-icon-btn"
            onClick={() => setActiveModal('none')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick 1-Tap Prompts for Clients */}
        <div className="ai-quick-prompts">
          {[
            '💅 Quiero pintarme o hacerme las uñas',
            '✂️ Quiero cortarme o teñirme el pelo',
            '💎 Tengo uñas cortas, ¿qué me conviene?',
            '✨ Quiero Combo Uñas + Pelo para un evento'
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="ai-prompt-chip"
              onClick={() => handleSend(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Messages */}
        <div className="ai-chat-body">
          {messages.map((m) => (
            <div key={m.id} className={`ai-msg-bubble ${m.role}`}>
              <p>{m.text}</p>
              {m.recommendations?.length > 0 && (
                <div className="ai-rec-list">
                  {m.recommendations.map((srv) => (
                    <div key={srv.id} className="ai-rec-card">
                      <img
                        src={srv.image}
                        alt={srv.name}
                        className="ai-rec-thumb"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/studio-nails.jpg';
                        }}
                      />
                      <div className="ai-rec-info">
                        <strong>{srv.name}</strong>
                        <span>
                          {currency}
                          {Number(srv.price).toLocaleString('es-AR')} • {srv.durationMin} min
                        </span>
                      </div>
                      <button
                        type="button"
                        className="ai-rec-book-btn"
                        onClick={() => handleApplyRecommendation(srv, m.suggestedShape)}
                      >
                        <CheckCircle2 size={13} />
                        <span>Elegir</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Row */}
        <form
          className="ai-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí qué te querés hacer en las uñas o el pelo..."
          />
          <button type="submit" className="ai-send-btn">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
