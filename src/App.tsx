/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  ChevronDown, 
  Truck, 
  ShieldCheck, 
  Clock, 
  Ruler, 
  ArrowRight,
  Instagram,
  MapPin,
  Star,
  X,
  ChevronLeft
} from 'lucide-react';

// --- Utilities ---

const formatAnswer = (ans: string) => {
  const mapping: { [key: string]: string } = {
    // Medidas
    "Sí": "Ya conozco mi medida",
    "Más o menos": "Tengo una idea, pero dudo de mi medida",
    "No": "No sé mi medida",
    "No, necesito ayuda": "No sé mi medida, necesito ayuda para medir",
    // Preferencias Flow A
    "Quiero este modelo": "Me interesa este modelo específico",
    "Quiero ver algo parecido": "Busco algo similar a este modelo",
    "Quiero que me orienten": "Necesito asesoramiento sobre este estilo",
    // Consultas Flow A
    "Stock / disponibilidad": "Consultar stock y disponibilidad",
    "Tiempo de entrega": "Consultar tiempos de entrega",
    "Variantes / medidas": "Consultar variantes o medidas especiales",
    "Ya quiero avanzar con la compra": "Quiero avanzar directamente con la compra",
    // Estilos Flow B
    "Algo delicado": "Busco un estilo delicado y fino",
    "Algo con más presencia": "Busco un anillo con más presencia y volumen",
    "Un regalo especial": "Busco un regalo especial con significado",
    // Destino Flow B
    "Para mí": "El anillo es para uso personal",
    "Para regalar": "El anillo es para hacer un regalo",
    // Objetivos Flow B
    "Ver opciones que me convienen": "Quiero ver opciones recomendadas",
    "Consultar stock / variantes": "Quiero consultar stock y variantes",
    "Definir medida": "Necesito ayuda para definir la medida",
    "Ya quiero avanzar": "Quiero avanzar con la compra"
  };
  return mapping[ans] || ans;
};

const trackMetaEvent = (eventName: string, eventData: any = {}, userData: any = {}) => {
  // Client-side Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', eventName, eventData);
  }

  // Server-side CAPI
  try {
    fetch('/api/meta-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, eventData, userData }),
      keepalive: true, // Crucial for tracking on redirect
    });
  } catch (error) {
    console.error('Error tracking Meta CAPI event:', error);
  }
};

// --- Components ---

const ConciergeModal = ({ isOpen, onClose, product }: any) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setAnswers([]);
      setIsRedirecting(false);
      trackMetaEvent('ViewContent', { 
        content_name: product ? 'Concierge Producto' : 'Concierge General',
        content_category: 'Concierge'
      });
    }
  }, [isOpen]);

  const flowASteps = [
    {
      title: "¿Querés este modelo o ver algo parecido?",
      options: ["Quiero este modelo", "Quiero ver algo parecido", "Quiero que me orienten"]
    },
    {
      title: "¿Ya sabés tu medida?",
      options: ["Sí", "Más o menos", "No, necesito ayuda"]
    },
    {
      title: "¿Qué querés resolver ahora?",
      options: ["Stock / disponibilidad", "Tiempo de entrega", "Variantes / medidas", "Ya quiero avanzar con la compra"]
    }
  ];

  const flowBSteps = [
    {
      title: "¿Qué tipo de anillo estás buscando?",
      options: ["Algo delicado", "Algo con más presencia", "Un regalo especial", "Quiero que me orienten"]
    },
    {
      title: "¿Es para vos o para regalar?",
      options: ["Para mí", "Para regalar"]
    },
    {
      title: "¿Ya sabés tu medida?",
      options: ["Sí", "Más o menos", "No"]
    },
    {
      title: "¿Qué querés hacer ahora?",
      options: ["Ver opciones que me convienen", "Consultar stock / variantes", "Definir medida", "Ya quiero avanzar"]
    }
  ];

  const steps = product ? flowASteps : flowBSteps;
  const isLastStep = step === steps.length;

  const handleOptionClick = (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    
    if (step === steps.length - 1) {
      // This is now handled by the direct <a> tag in the render method for 100% reliability.
      // But we keep this as a fallback just in case.
      const formattedAnswers = newAnswers.map(formatAnswer);

      const message = product 
        ? `*NUEVA CONSULTA - CÁPSULA DE ANILLOS*

*Producto:* ${product.name}
*Precio:* $${product.price}

*Preferencia:* ${formattedAnswers[0]}
*Medida:* ${formattedAnswers[1]}
*Consulta específica:* ${formattedAnswers[2]}

_Enviado desde la Landing Page de Rapagnani_`
        : `*NUEVA CONSULTA - ASESORAMIENTO GENERAL*

*Estilo buscado:* ${formattedAnswers[0]}
*Destino:* ${formattedAnswers[1]}
*Medida:* ${formattedAnswers[2]}
*Objetivo:* ${formattedAnswers[3]}

_Enviado desde la Landing Page de Rapagnani_`;

      const whatsappUrl = `https://api.whatsapp.com/send?phone=5491169302959&text=${encodeURIComponent(message)}`;
      
      window.location.href = whatsappUrl;

      setTimeout(() => {
        trackMetaEvent('Lead', {
          content_name: product ? `WhatsApp - ${product.name}` : 'WhatsApp - General',
          content_category: 'Concierge',
          value: product ? parseFloat(product.price.replace('.', '')) : 0,
          currency: 'ARS'
        });

        setIsRedirecting(true);
        setStep(step + 1);
      }, 50);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0 && !isRedirecting) {
      setStep(step - 1);
      setAnswers(answers.slice(0, -1));
    }
  };

  const handleDirectWhatsApp = () => {
    const message = product 
      ? `Hola, vengo de la cápsula de anillos y me interesó el modelo ${product.name}. ¿Me podrían ayudar con la medida y disponibilidad?`
      : "Hola, vengo de la cápsula de anillos y quiero que me ayuden a elegir modelo y medida.";
    
    trackMetaEvent('Contact', {
      content_name: product ? `WhatsApp Directo - ${product.name}` : 'WhatsApp Directo - General',
      content_category: 'Concierge'
    });

    window.location.assign(`https://api.whatsapp.com/send?phone=5491169302959&text=${encodeURIComponent(message)}`);
    // No onClose() here either for reliability
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-brand-ivory flex flex-col"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-brand-champagne/10">
            <button 
              onClick={handleBack} 
              className={`p-2 -ml-2 transition-opacity ${step === 0 || isLastStep ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-brand-taupe">
              {!isLastStep ? `${step + 1} de ${steps.length}` : 'Redirigiendo'}
            </div>
            <button onClick={onClose} className="p-2 -mr-2">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-12 flex flex-col max-w-xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {!isLastStep ? (
                <motion.div
                  key={step}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <div className="mb-8">
                    <p className="text-xs uppercase tracking-widest text-brand-taupe mb-2">
                      Respondé 3 preguntas rápidas y seguís por WhatsApp
                    </p>
                    <h2 className="text-2xl font-serif leading-tight text-brand-charcoal">
                      {steps[step].title}
                    </h2>
                  </div>

                  {step === 0 && product && (
                    <div className="flex flex-col gap-4 p-6 bg-white rounded-2xl mb-8 border border-brand-champagne/10 shadow-sm">
                      <div className="flex items-center gap-4">
                        <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl" referrerPolicy="no-referrer" />
                        <div>
                          <p className="text-sm font-serif text-brand-charcoal">{product.name}</p>
                          <p className="text-xs font-medium text-brand-taupe">${product.price}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-brand-champagne/10 flex flex-col gap-3">
                        <p className="text-[11px] italic text-brand-taupe leading-relaxed">
                          "{product.hook}"
                        </p>
                        <div className="flex items-center gap-2 bg-brand-ivory p-2 rounded-lg">
                          <ShieldCheck className="w-3 h-3 text-brand-taupe" />
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-brand-taupe">Garantía de talle y cambio</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {steps[step].options.map((option, i) => {
                      const isLastStep = step === steps.length - 1;
                      
                      if (isLastStep) {
                        const tempAnswers = [...answers, option];
                        const formatted = tempAnswers.map(formatAnswer);
                        const msg = product 
                          ? `*NUEVA CONSULTA - CÁPSULA DE ANILLOS*
*Producto:* ${product.name}
*Precio:* $${product.price}
*Preferencia:* ${formatted[0]}
*Medida:* ${formatted[1]}
*Consulta específica:* ${formatted[2]}`
                          : `*NUEVA CONSULTA - ASESORAMIENTO GENERAL*
*Estilo buscado:* ${formatted[0]}
*Destino:* ${formatted[1]}
*Medida:* ${formatted[2]}
*Objetivo:* ${formatted[3]}`;
                        
                        const url = `https://api.whatsapp.com/send?phone=5491169302959&text=${encodeURIComponent(msg)}`;
                        
                        return (
                          <a
                            key={i}
                            href={url}
                            onClick={() => {
                              trackMetaEvent('Lead', {
                                content_name: product ? `WhatsApp - ${product.name}` : 'WhatsApp - General',
                                content_category: 'Concierge',
                                value: product ? parseFloat(product.price.replace('.', '')) : 0,
                                currency: 'ARS'
                              });
                              setTimeout(() => {
                                setIsRedirecting(true);
                                setStep(step + 1);
                              }, 100);
                            }}
                            className="w-full text-left p-5 rounded-2xl bg-white border border-brand-champagne/10 hover:border-brand-taupe transition-all duration-300 group block no-underline"
                          >
                            <span className="text-sm font-medium text-brand-charcoal group-hover:text-brand-taupe transition-colors">
                              {option}
                            </span>
                          </a>
                        );
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handleOptionClick(option)}
                          className="w-full text-left p-5 rounded-2xl bg-white border border-brand-champagne/10 hover:border-brand-taupe transition-all duration-300 group"
                        >
                          <span className="text-sm font-medium text-brand-charcoal group-hover:text-brand-taupe transition-colors">
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex-1 flex flex-col justify-center text-center"
                >
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-2 border-brand-champagne border-t-brand-taupe rounded-full mx-auto mb-8"
                  />
                  <h2 className="text-3xl font-serif mb-4">
                    Perfecto, te llevamos a WhatsApp...
                  </h2>
                  <p className="text-brand-taupe mb-10">
                    Paula ya tiene tus respuestas para asesorarte mejor.
                  </p>
                  
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      boxShadow: [
                        "0 0 0 0 rgba(37, 211, 102, 0)",
                        "0 0 20px 10px rgba(37, 211, 102, 0.2)",
                        "0 0 0 0 rgba(37, 211, 102, 0)"
                      ]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: "easeInOut" 
                    }}
                    className="rounded-full"
                  >
                    <Button 
                      variant="whatsapp" 
                      onClick={() => {
                        const message = product 
                          ? `*NUEVA CONSULTA - CÁPSULA DE ANILLOS*
*Producto:* ${product.name}
*Precio:* $${product.price}
*Preferencia:* ${answers[0]}
*Medida:* ${answers[1]}
*Consulta específica:* ${answers[2]}`
                          : `*NUEVA CONSULTA - ASESORAMIENTO GENERAL*
*Estilo buscado:* ${answers[0]}
*Destino:* ${answers[1]}
*Medida:* ${answers[2]}
*Objetivo:* ${answers[3]}`;
                        
                        trackMetaEvent('Contact', { 
                          content_name: 'WhatsApp Fallback Button', 
                          content_category: 'Concierge',
                          content_label: product ? product.name : 'General'
                        });

                        window.location.href = `https://api.whatsapp.com/send?phone=5491169302959&text=${encodeURIComponent(message)}`;
                      }}
                      icon={MessageCircle}
                      className="w-full"
                    >
                      Abrir WhatsApp ahora
                    </Button>
                  </motion.div>
                  <p className="mt-4 text-[10px] uppercase tracking-widest text-brand-taupe">
                    Si no abre solo, hacé clic en el botón
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer / Skip */}
          {!isLastStep && (
            <div className="p-8 text-center">
              <button 
                onClick={handleDirectWhatsApp}
                className="text-[10px] uppercase tracking-widest text-brand-taupe/60 hover:text-brand-taupe transition-colors underline underline-offset-4"
              >
                Ir directo a WhatsApp
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Button = ({ children, onClick, className = "", variant = "primary", icon: Icon }: any) => {
  const baseStyles = "inline-flex items-center justify-center px-8 py-4 rounded-full font-medium transition-all duration-300 text-sm tracking-wide uppercase";
  const variants: any = {
    primary: "bg-brand-charcoal text-white hover:bg-opacity-90 shadow-md",
    outline: "border border-brand-charcoal text-brand-charcoal hover:bg-brand-charcoal hover:text-white",
    whatsapp: "bg-[#25D366] text-white hover:bg-opacity-90 shadow-lg"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      aria-label={typeof children === 'string' ? children : 'Botón de acción'}
    >
      {children}
      {Icon && <Icon className="ml-2 w-4 h-4" />}
    </button>
  );
};

const Accordion = ({ title, children }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-brand-champagne/30 py-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left group"
      >
        <span className="text-base font-medium text-brand-charcoal/90 group-hover:text-brand-charcoal transition-colors">
          {title}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pt-4 text-brand-taupe text-sm leading-relaxed">
              {children}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ProductCard = ({ image, name, price, description, hook, tag, onSelect }: any) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="group cursor-pointer"
    onClick={onSelect}
  >
    <div className="aspect-[4/5] overflow-hidden bg-white mb-4 relative">
      <img 
        src={image} 
        alt={name} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {tag && (
          <span className="bg-brand-charcoal text-white text-[8px] uppercase tracking-[0.2em] px-2 py-1 rounded font-bold shadow-sm">
            {tag}
          </span>
        )}
      </div>
    </div>
    <h3 className="text-lg font-serif mb-1">{name}</h3>
    <p className="text-[10px] text-brand-taupe uppercase tracking-widest mb-2 font-medium italic">"{description}"</p>
    <p className="text-sm font-medium text-brand-charcoal mb-3">${price}</p>
    <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
      <p className="text-[9px] text-brand-taupe leading-relaxed mb-3 max-w-[90%]">
        {hook}
      </p>
      <div className="flex flex-col gap-1">
        <p className="text-[10px] uppercase tracking-widest border-b border-brand-charcoal pb-1 inline-block w-fit font-bold">
          Avanzar con este anillo
        </p>
        <p className="text-[8px] uppercase tracking-widest text-brand-taupe">
          Respondé 3 preguntas rápidas y seguís por WhatsApp
        </p>
      </div>
    </div>
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [showSticky, setShowSticky] = useState(false);
  const [isConciergeOpen, setIsConciergeOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleWhatsApp = (product: any = null) => {
    setSelectedProduct(product);
    setIsConciergeOpen(true);
  };

  const rings = [
    {
      id: 1,
      name: "Anillo Destello Eterno",
      price: "110.000",
      description: "Luz y presencia en una pieza que se nota.",
      image: "https://i.postimg.cc/26czPdrZ/Chat-GPT-Image-23-mar-2026-06-12-54-p-m.png",
      hook: "Plata 925 con circones. Ideal para usar solo o combinar.",
      tag: "Más Elegido"
    },
    {
      id: 2,
      name: "Anillo Aurora de la Duquesa",
      price: "98.000",
      description: "Delicadeza noble para todos los días.",
      image: "https://i.postimg.cc/PJtsSPBy/Chat-GPT-Image-23-mar-2026-06-46-57-p-m.png",
      hook: "Plata 925. Un diseño esencial que nunca falla.",
      tag: "Elegante y versátil"
    },
    {
      id: 3,
      name: "Anillo Magnolia",
      price: "140.000",
      description: "Personalidad distintiva en cada detalle.",
      image: "https://i.postimg.cc/PJdKgZfJ/Chat-GPT-Image-23-mar-2026-06-39-02-p-m.png",
      hook: "Plata 925. Diseño exclusivo con terminación artesanal.",
      tag: "Diseño distintivo"
    },
    {
      id: 4,
      name: "Anillo Ternura",
      price: "150.000",
      description: "Un regalo con significado real.",
      image: "https://i.postimg.cc/RVLxJQJ1/Chat-GPT-Image-23-mar-2026-06-37-42-p-m.png",
      hook: "Plata 925. La pieza perfecta para un momento especial.",
      tag: "Regalo ideal"
    },
    {
      id: 5,
      name: "Anillo Luz de la Reina",
      price: "170.000",
      description: "Distinción y brillo de alta gama.",
      image: "https://i.postimg.cc/nLkx8KpH/Chat-GPT-Image-23-mar-2026-06-35-50-p-m.png",
      hook: "Plata 925. Una de las piezas más elevadas de la cápsula.",
      tag: "Pieza protagonista"
    },
    {
      id: 6,
      name: "Anillo Rubí de la Emperatriz",
      price: "185.000",
      description: "Una joya con carácter y color.",
      image: "https://i.postimg.cc/6q16krV1/Chat-GPT-Image-23-mar-2026-06-34-04-p-m.png",
      hook: "Plata 925 con piedra central. Presencia absoluta.",
      tag: "Stock inmediato"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col selection:bg-brand-champagne selection:text-brand-charcoal">
      {/* --- HEADER --- */}
      <header className="absolute top-0 left-0 right-0 z-50 py-8 px-6">
        <div className="container mx-auto flex justify-center md:justify-start">
          <img 
            src="https://i.postimg.cc/bwnC2q51/image.png" 
            alt="Rapagnani Joyería Logo" 
            className="h-10 md:h-12 object-contain"
            referrerPolicy="no-referrer"
          />
        </div>
      </header>

      <main>
        {/* --- SECCIÓN 1: HERO --- */}
      <section className="relative min-h-[90vh] flex flex-col justify-center px-6 pt-20 pb-12 overflow-hidden bg-[#F2F0ED]">
        <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="z-10"
          >
            <span className="inline-block text-xs uppercase tracking-[0.3em] text-brand-taupe mb-6">
              Nueva Cápsula Curada
            </span>
            <h1 className="text-4xl md:text-6xl font-serif leading-[1.1] mb-6 text-brand-charcoal">
              Anillos de plata para elegir con <span className="italic">más claridad y más gusto.</span>
            </h1>
            <p className="text-lg text-brand-taupe mb-8 max-w-md leading-relaxed">
              Una selección curada de 6 modelos Rapagnani, con asesoramiento real para ayudarte a definir estilo, medida y disponibilidad antes de pasar a WhatsApp.
            </p>
            <div className="flex items-center gap-2 mb-10 text-[10px] uppercase tracking-widest text-brand-taupe font-semibold">
              <span>Plata 925</span>
              <span className="opacity-30">•</span>
              <span>Joyería desde 1957</span>
              <span className="opacity-30">•</span>
              <span>Envíos a todo el país</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleWhatsApp()} icon={MessageCircle}>
                  Elegir mi anillo
                </Button>
                <p className="text-[10px] uppercase tracking-widest text-brand-taupe text-center">
                  Respondé 3 preguntas rápidas y seguís por WhatsApp
                </p>
              </div>
              <div className="flex items-center gap-3 px-2">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-ivory bg-brand-champagne overflow-hidden">
                      <img src={`https://i.pravatar.cc/100?u=${i}`} alt="User" referrerPolicy="no-referrer" />
                    </div>
                  ))}
                </div>
                <span className="text-xs text-brand-taupe font-medium">
                  +500 mujeres asesoradas
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative aspect-[4/5] lg:aspect-square"
          >
            <img 
              src="https://i.postimg.cc/GhM0L3yL/image.png" 
              alt="Rapagnani Anillos" 
              className="w-full h-full object-cover rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-xl hidden md:block">
              <p className="text-sm font-serif italic text-brand-charcoal">"Momentos hechos joyas"</p>
              <p className="text-[10px] uppercase tracking-widest text-brand-taupe mt-1">Desde 1957</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- SECCIÓN 2: BARRA DE CONFIANZA --- */}
      <section className="bg-white py-10 border-y border-brand-champagne/20">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <Clock className="w-5 h-5 text-brand-taupe mb-3" />
              <span className="text-[10px] uppercase tracking-widest font-semibold">Joyería desde 1957</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Truck className="w-5 h-5 text-brand-taupe mb-3" />
              <span className="text-[10px] uppercase tracking-widest font-semibold">Envíos a todo el país</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <MessageCircle className="w-5 h-5 text-brand-taupe mb-3" />
              <span className="text-[10px] uppercase tracking-widest font-semibold">Atención personalizada</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <ShieldCheck className="w-5 h-5 text-brand-taupe mb-3" />
              <span className="text-[10px] uppercase tracking-widest font-semibold">Calidad Garantizada</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 3: PRESENTACIÓN DE LA CÁPSULA --- */}
      <section className="py-24 px-6 bg-brand-ivory" id="capsula">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">La Selección Curada</h2>
            <p className="text-brand-taupe max-w-lg mx-auto">
              Piezas elegidas por su equilibrio entre delicadeza y presencia. Pensadas para ser usadas, no guardadas.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-y-16">
            {rings.map((ring) => (
              <ProductCard 
                key={ring.id}
                {...ring}
                onSelect={() => handleWhatsApp(ring)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 4: VALOR PERCIBIDO --- */}
      <section className="py-24 px-6 bg-brand-charcoal text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
           <img src="https://picsum.photos/seed/texture/800/800" className="w-full h-full object-cover" alt="" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
                No es solo una selección linda. <br />
                Es una forma más <span className="italic">clara de elegir bien.</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-brand-champagne font-serif italic text-xl">1</div>
                  <div>
                    <h4 className="text-lg font-medium mb-2">Selección curada</h4>
                    <p className="text-white/60 text-sm leading-relaxed">No vas a recorrer toda la tienda: te mostramos una cápsula pensada para decidir mejor.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-brand-champagne font-serif italic text-xl">2</div>
                  <div>
                    <h4 className="text-lg font-medium mb-2">Asesoramiento real</h4>
                    <p className="text-white/60 text-sm leading-relaxed">Te ayudamos con modelo, medida y disponibilidad antes de comprar.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-brand-champagne font-serif italic text-xl">3</div>
                  <div>
                    <h4 className="text-lg font-medium mb-2">Calidad con historia</h4>
                    <p className="text-white/60 text-sm leading-relaxed">Plata 925, joyería con historia desde 1957 y atención cercana.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://i.postimg.cc/bvfdTRww/image.png" 
                alt="Criterio Joyería" 
                className="rounded-2xl shadow-2xl grayscale-[20%]"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 5: CÓMO FUNCIONA --- */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif mb-4">Tu experiencia de compra</h2>
            <p className="text-brand-taupe">Simple, humana y sin errores.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Elegí el modelo que más te guste", desc: "Recorré la cápsula y quedate con el anillo que más vaya con vos." },
              { step: "02", title: "Definí medida y disponibilidad por WhatsApp", desc: "Te ayudamos a resolver talla, stock y variantes sin vueltas." },
              { step: "03", title: "Confirmá y recibilo", desc: "Coordinamos pago y envío para que lo recibas con tranquilidad." }
            ].map((item, i) => (
              <div key={i} className="text-center">
                <span className="block text-4xl font-serif italic text-brand-champagne mb-4">{item.step}</span>
                <h4 className="text-lg font-medium mb-3">{item.title}</h4>
                <p className="text-sm text-brand-taupe leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 6: RESPALDO --- */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-serif mb-12 text-center">Por qué confiar en Rapagnani</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { icon: Clock, title: "Joyería desde 1957", desc: "Trayectoria real" },
              { icon: ShieldCheck, title: "Plata 925", desc: "Calidad garantizada" },
              { icon: MessageCircle, title: "Asesoramiento real", desc: "Por WhatsApp" },
              { icon: Truck, title: "Envíos a todo el país", desc: "Seguros y rápidos" },
              { icon: MapPin, title: "Atención desde Nordelta", desc: "Cercanía y seriedad" }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-brand-ivory flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-brand-taupe" />
                </div>
                <h4 className="text-[10px] uppercase tracking-widest font-bold mb-1">{item.title}</h4>
                <p className="text-[9px] text-brand-taupe uppercase tracking-wider">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 7: FAQ --- */}
      <section className="py-24 px-6 bg-brand-ivory">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-serif mb-12 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-2">
            <Accordion title="¿Cómo elijo mi medida?">
              Podés consultar la <strong>Guía de talles</strong> que encontrás más abajo en esta página. De todas formas, por WhatsApp te acompañamos en el proceso para que no haya errores.
            </Accordion>
            <Accordion title="¿Qué pasa si quiero otra medida o no hay stock?">
              Justamente por eso hablamos por WhatsApp. Si el modelo que te gusta no está en tu talle exacto, te confirmamos disponibilidad o tiempos de fabricación (generalmente 7-10 días).
            </Accordion>
            <Accordion title="¿Hacen envíos a todo el país?">
              Sí, hacemos envíos seguros a toda la Argentina a través de Correo Argentino o Andreani, directo a tu domicilio o a la sucursal que prefieras.
            </Accordion>
            <Accordion title="¿Cómo es el proceso de compra?">
              Primero definimos modelo y medida juntos por WhatsApp. Una vez confirmado, te enviamos el link de pago o datos para transferencia y coordinamos el envío.
            </Accordion>
            <Accordion title="¿Qué medios de pago aceptan?">
              Podés pagar con transferencia bancaria, tarjetas de crédito y Mercado Pago. Siempre buscamos la opción que te resulte más cómoda.
            </Accordion>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 8: GUÍA DE TALLES --- */}
      <section className="py-20 px-6 bg-white border-t border-brand-champagne/10">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif mb-4 text-brand-charcoal">Guía de talles</h2>
            <p className="text-brand-taupe text-sm max-w-lg mx-auto leading-relaxed">
              Si no sabés tu medida o querés confirmar stock, podés usar esta guía como referencia o escribirnos directamente.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <span className="block text-2xl font-serif italic text-brand-champagne mb-2">01</span>
              <p className="text-xs font-medium text-brand-charcoal leading-tight">Buscá un anillo que te quede bien.</p>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-serif italic text-brand-champagne mb-2">02</span>
              <p className="text-xs font-medium text-brand-charcoal leading-tight">Medí el diámetro interno en milímetros.</p>
            </div>
            <div className="text-center">
              <span className="block text-2xl font-serif italic text-brand-champagne mb-2">03</span>
              <p className="text-xs font-medium text-brand-charcoal leading-tight">Compará esa medida con la tabla de equivalencias.</p>
            </div>
          </div>

          <div className="bg-brand-ivory/50 rounded-3xl p-8 md:p-12 border border-brand-champagne/10">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-6 gap-y-6">
              {[
                { n: 8, mm: 15.2 }, { n: 9, mm: 15.5 }, { n: 10, mm: 15.9 }, { n: 11, mm: 16.2 },
                { n: 12, mm: 16.5 }, { n: 13, mm: 16.8 }, { n: 14, mm: 17.1 }, { n: 15, mm: 17.4 },
                { n: 16, mm: 17.8 }, { n: 17, mm: 18.0 }, { n: 18, mm: 18.4 }, { n: 19, mm: 18.7 },
                { n: 20, mm: 19.0 }, { n: 21, mm: 19.3 }, { n: 22, mm: 19.6 }, { n: 23, mm: 20.0 },
                { n: 24, mm: 20.3 }, { n: 25, mm: 20.6 }, { n: 26, mm: 21.0 }, { n: 27, mm: 21.3 },
                { n: 28, mm: 21.6 }, { n: 29, mm: 22.0 }, { n: 30, mm: 22.3 }
              ].map((size) => (
                <div key={size.n} className="flex justify-between items-center border-b border-brand-champagne/20 pb-2 px-1">
                  <span className="text-[10px] font-bold text-brand-charcoal">N° {size.n}</span>
                  <span className="text-[10px] text-brand-taupe">{size.mm} mm</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-[10px] text-brand-taupe italic text-center">
              Importante: la medida puede variar según el dedo en el que vayas a usar el anillo.
            </p>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-brand-taupe mb-4">Si todavía te quedan dudas, te ayudamos por WhatsApp a definir la medida correcta.</p>
            <div className="flex flex-col items-center gap-2">
              <button 
                onClick={() => handleWhatsApp()}
                className="text-brand-charcoal font-bold text-xs uppercase tracking-widest border-b border-brand-charcoal pb-1 hover:text-brand-taupe hover:border-brand-taupe transition-colors"
              >
                Quiero ayuda para elegir
              </button>
              <p className="text-[8px] uppercase tracking-widest text-brand-taupe">
                Respondé 3 preguntas rápidas y seguís por WhatsApp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 9: CTA FINAL --- */}
      <section className="py-24 px-6 bg-brand-charcoal text-white text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-4xl font-serif mb-6 italic">Encontrá el anillo que más va con vos.</h2>
          <p className="text-white/60 mb-10 leading-relaxed">
            Te ayudamos a definir modelo, medida y disponibilidad con una conversación simple y clara por WhatsApp.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button 
              variant="whatsapp" 
              onClick={() => handleWhatsApp()}
              className="w-full sm:w-auto"
              icon={MessageCircle}
            >
              Elegir mi anillo
            </Button>
            <p className="text-[10px] uppercase tracking-widest text-white/40">
              Respondé 3 preguntas rápidas y seguís por WhatsApp
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-6">
            Atención personalizada de Lunes a Viernes
          </p>
        </div>
      </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 bg-white border-t border-brand-champagne/10 text-center">
        <div className="container mx-auto">
          <img 
            src="https://i.postimg.cc/bwnC2q51/image.png" 
            alt="Rapagnani Logo" 
            className="h-12 mx-auto mb-6 object-contain grayscale hover:grayscale-0 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          <p className="text-xs text-brand-taupe uppercase tracking-widest mb-8">Joyería con historia · Desde 1957</p>
          <div className="flex justify-center gap-6 mb-8">
            <a href="https://www.instagram.com/rapagnani.nordelta" target="_blank" rel="noopener noreferrer">
              <Instagram className="w-5 h-5 text-brand-taupe cursor-pointer hover:text-brand-charcoal transition-colors" />
            </a>
            <a href="https://api.whatsapp.com/send?phone=5491169302959" target="_blank" rel="noopener noreferrer" className="hover:text-brand-champagne transition-colors">
              <MessageCircle className="w-5 h-5 text-brand-taupe cursor-pointer hover:text-brand-charcoal transition-colors" />
            </a>
          </div>
          <div className="flex flex-col items-center gap-2 text-brand-taupe text-sm mb-8">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Barrio Cabos del Lago, Lote 125, Nordelta</span>
            </div>
          </div>
          <p className="text-[10px] text-brand-taupe/60">© 2024 Rapagnani Joyería. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* --- STICKY CTA MOBILE --- */}
      <AnimatePresence>
        {showSticky && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 p-4 z-50 md:hidden"
          >
            <button 
              onClick={() => handleWhatsApp()}
              className="w-full bg-[#25D366] text-white py-4 rounded-full font-bold shadow-2xl flex items-center justify-center gap-3 uppercase tracking-wider text-sm"
            >
              <MessageCircle className="w-5 h-5" />
              Consultar por WhatsApp
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {/* --- CONCIERGE MODAL --- */}
      <ConciergeModal 
        isOpen={isConciergeOpen} 
        onClose={() => setIsConciergeOpen(false)} 
        product={selectedProduct}
      />
    </div>
  );
}
