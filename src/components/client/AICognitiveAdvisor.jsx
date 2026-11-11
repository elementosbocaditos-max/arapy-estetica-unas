import React, { useState, useEffect } from 'react';
import { Send, X, CheckCircle2, Wand2 } from 'lucide-react';
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

  const {
    branding = {},
    categories = [],
    services = [],
    inspoGallery = [],
    operations = {}
  } = tenantDb;
  const currency = operations.currencySymbol || '$';

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text:
          operations.aiGreeting ||
          `¡Hola! Soy la Asesora IA de ${branding.businessName}. Estamos en ${operations.address || 'nuestro local'} (${operations.businessHoursText || 'horarios disponibles'}). ¿Qué trabajo te gustaría realizarte hoy?`,
        recommendations: services.slice(0, 3)
      }
    ]);
  }, [
    branding.businessName,
    operations.aiGreeting,
    operations.address,
    operations.businessHoursText,
    services
  ]);

  if (activeModal !== 'ai') return null;

  const generateSmartResponse = (userText) => {
    const q = userText.toLowerCase();

    // Check if the query matches any dynamic category or service name/description
    const matchedByKeyword = services.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.shortDesc || '').toLowerCase().includes(q) ||
        q.includes(s.name.toLowerCase().split(' ')[0])
    );

    const matchedCat = categories.find(
      (c) =>
        q.includes((c.name || '').toLowerCase()) ||
        q.includes((c.shortLabel || '').toLowerCase()) ||
        q.includes((c.id || '').toLowerCase())
    );

    if (q.includes('horario') || q.includes('direcci') || q.includes('ubicaci') || q.includes('telefono') || q.includes('whatsapp')) {
      return {
        text: `📍 Dirección: ${operations.address || 'Consultar'}\n🕒 Horarios: ${operations.businessHoursText || 'Consultar'}\n📞 Teléfono / WhatsApp: ${operations.phoneDisplay || operations.whatsappNumber}\n💳 Seña: ${operations.depositPercentage ?? 50}% (Alias: ${operations.paymentAlias}).\n\nElegí cualquiera de nuestros trabajos para reservar:`,
        suggestedShape: operations.workOptions?.[0] || 'A elección',
        recommendations: services.slice(0, 3)
      };
    }

    if (matchedByKeyword.length > 0) {
      return {
        text: `Encontré estas opciones en nuestro catálogo de ${branding.businessName} que coinciden con lo que buscás:`,
        suggestedShape: operations.workOptions?.[0] || 'A elección',
        recommendations: matchedByKeyword
      };
    }

    if (matchedCat) {
      const catServices = services.filter((s) => s.category === matchedCat.id);
      return {
        text: `En la categoría ${matchedCat.icon} ${matchedCat.name} tenemos estas opciones disponibles para vos:`,
        suggestedShape: operations.workOptions?.[0] || 'A elección',
        recommendations: catServices.length > 0 ? catServices : services
      };
    }

    return {
      text: `Te recomiendo estos trabajos destacados de ${branding.businessName}. Al elegir uno, te llevo directo a la reserva con las fotos de muestra y horarios disponibles:`,
      suggestedShape: operations.workOptions?.[0] || 'A elección',
      recommendations: services.slice(0, 4)
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
    const matchingInspo = inspoGallery
      .filter((i) => i.linkedServiceId === srv.id || i.category === srv.category)
      .map((i) => i.id);
    if (matchingInspo.length > 0) {
      setAddedInspoIds(matchingInspo.slice(0, 3));
    }
    setActiveModal('none');
    selectServiceAndGoToBooking(srv.id, false);
  };

  // Dynamic quick prompts built from the tenant's actual categories
  const dynamicPrompts = [
    ...categories.map((cat) => `${cat.icon} Ver opciones de ${cat.shortLabel || cat.name}`),
    '📍 ¿Cuál es la dirección, horarios y teléfono?'
  ];

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
              <p>Conectada en tiempo real a tus servicios, categorías y horarios</p>
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

        {/* Dynamic Quick Prompts based on Owner's Categories */}
        <div className="ai-quick-prompts">
          {dynamicPrompts.map((prompt) => (
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
              <p style={{ whiteSpace: 'pre-line' }}>{m.text}</p>
              {m.recommendations?.length > 0 && (
                <div className="ai-rec-list">
                  {m.recommendations.map((srv) => (
                    <div key={srv.id} className="ai-rec-card">
                      <img
                        src={srv.image}
                        alt={srv.name}
                        className="ai-rec-thumb"
                        onError={(e) => {
                          e.currentTarget.src = './assets/studio-nails.jpg';
                        }}
                      />
                      <div className="ai-rec-info">
                        <strong>{srv.name}</strong>
                        <span>
                          {currency}
                          {Number(srv.price || 0).toLocaleString('es-AR')} • {srv.durationMin}{' '}
                          min
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
            placeholder="Consultá por cualquier servicio, precio u horario..."
          />
          <button type="submit" className="ai-send-btn">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
