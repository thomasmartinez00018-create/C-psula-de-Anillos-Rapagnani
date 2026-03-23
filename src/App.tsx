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

const trackMetaEvent = async (eventName: string, eventData: any = {}, userData: any = {}) => {
  // Client-side Pixel
  if ((window as any).fbq) {
    (window as any).fbq('track', eventName, eventData);
  }

  // Server-side CAPI
  try {
    await fetch('/api/meta-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, eventData, userData }),
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
      setIsRedirecting(true);
      setStep(step + 1);
      
      // Mapeo de respuestas para que sean más legibles para el negocio
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

      setTimeout(() => {
        trackMetaEvent('Lead', {
          content_name: product ? `WhatsApp - ${product.name}` : 'WhatsApp - General',
          content_category: 'Concierge',
          value: product ? parseFloat(product.price.replace('.', '')) : 0,
          currency: 'ARS'
        });
        window.location.href = `https://wa.me/5491169302959?text=${encodeURIComponent(message)}`;
        onClose();
      }, 800);
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

    window.location.href = `https://wa.me/5491169302959?text=${encodeURIComponent(message)}`;
    onClose();
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
                      {product ? 'Te orientamos en 3 pasos' : 'Te orientamos en 4 pasos'}
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
                    {steps[step].options.map((option, i) => (
                      <button
                        key={i}
                        onClick={() => handleOptionClick(option)}
                        className="w-full text-left p-5 rounded-2xl bg-white border border-brand-champagne/10 hover:border-brand-taupe transition-all duration-300 group"
                      >
                        <span className="text-sm font-medium text-brand-charcoal group-hover:text-brand-taupe transition-colors">
                          {option}
                        </span>
                      </button>
                    ))}
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
                    className="w-20 h-20 border-2 border-brand-champagne border-t-brand-taupe rounded-full mx-auto mb-8"
                  />
                  <h2 className="text-3xl font-serif mb-4">
                    Perfecto, te llevamos a WhatsApp...
                  </h2>
                  <p className="text-brand-taupe">
                    Paula ya tiene tus respuestas para asesorarte mejor.
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
        <span className="bg-white/90 backdrop-blur-sm text-[8px] uppercase tracking-[0.2em] px-2 py-1 rounded font-bold text-brand-charcoal shadow-sm">
          Stock Inmediato
        </span>
        {tag && (
          <span className="bg-brand-charcoal text-white text-[8px] uppercase tracking-[0.2em] px-2 py-1 rounded font-bold shadow-sm">
            {tag}
          </span>
        )}
      </div>
    </div>
    <h3 className="text-lg font-serif mb-1">{name}</h3>
    <p className="text-[10px] text-brand-taupe uppercase tracking-widest mb-2 font-medium italic">"{description}"</p>
    <p className="text-sm font-medium text-brand-charcoal">${price}</p>
    <div className="mt-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
      <p className="text-[9px] text-brand-taupe leading-relaxed mb-2 max-w-[90%]">
        {hook}
      </p>
      <p className="text-[10px] uppercase tracking-widest border-b border-brand-charcoal pb-1 inline-block mb-1">
        Avanzar con este anillo
      </p>
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
      name: "Anillo Aurora de la Duquesa",
      price: "98.000",
      description: "Quiero algo fino y fácil de elegir.",
      image: "https://i.postimg.cc/PJtsSPBy/Chat-GPT-Image-23-mar-2026-06-46-57-p-m.png",
      hook: "Si querés empezar por un anillo delicado y fácil de usar, este es de los más nobles de la cápsula.",
      tag: "Clásico Esencial"
    },
    {
      id: 2,
      name: "Anillo Destello Eterno",
      price: "110.000",
      description: "Quiero un anillo delicado que sí se note.",
      image: "https://i.postimg.cc/26czPdrZ/Chat-GPT-Image-23-mar-2026-06-12-54-p-m.png",
      hook: "Ese anillo que suma luz y presencia sin volverse exagerado.",
      tag: "Más Elegido"
    },
    {
      id: 3,
      name: "Anillo Magnolia",
      price: "140.000",
      description: "No quiero algo obvio.",
      image: "https://i.postimg.cc/PJdKgZfJ/Chat-GPT-Image-23-mar-2026-06-39-02-p-m.png",
      hook: "Si no querés un anillo más, Magnolia tiene otra personalidad.",
      tag: "Diseño Único"
    },
    {
      id: 4,
      name: "Anillo Ternura",
      price: "150.000",
      description: "Quiero que tenga significado.",
      image: "https://i.postimg.cc/RVLxJQJ1/Chat-GPT-Image-23-mar-2026-06-37-42-p-m.png",
      hook: "Una pieza para regalar cuando no querés caer en algo frío.",
      tag: "Regalo Ideal"
    },
    {
      id: 5,
      name: "Anillo Luz de la Reina",
      price: "170.000",
      description: "Quiero una pieza más distinguida.",
      image: "https://i.postimg.cc/nLkx8KpH/Chat-GPT-Image-23-mar-2026-06-35-50-p-m.png",
      hook: "Si querés una pieza más distinguida, esta es de las que más elevan la cápsula.",
      tag: "Alta Elegancia"
    },
    {
      id: 6,
      name: "Anillo Rubí de la Emperatriz",
      price: "185.000",
      description: "Quiero una joya protagonista.",
      image: "https://i.postimg.cc/6q16krV1/Chat-GPT-Image-23-mar-2026-06-34-04-p-m.png",
      hook: "Color, presencia y personalidad en una pieza que no pasa desapercibida.",
      tag: "Statement Piece"
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
            <h1 className="text-5xl md:text-7xl font-serif leading-[1.1] mb-6 text-brand-charcoal">
              Anillos que cuentan <br /> 
              <span className="italic">tu historia.</span>
            </h1>
            <p className="text-lg text-brand-taupe mb-10 max-w-md leading-relaxed">
              Una selección exclusiva de piezas en plata, diseñadas para mujeres que eligen con criterio y sensibilidad.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col gap-2">
                <Button onClick={() => handleWhatsApp()} icon={MessageCircle}>
                  Elegir mi anillo
                </Button>
                <p className="text-[10px] uppercase tracking-widest text-brand-taupe text-center">
                  Te orientamos en 4 pasos antes de WhatsApp
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
                No es solo un catálogo, <br />
                es un <span className="italic">criterio.</span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-brand-champagne font-serif italic text-xl">1</div>
                  <div>
                    <h4 className="text-lg font-medium mb-2">Selección Consciente</h4>
                    <p className="text-white/60 text-sm leading-relaxed">Evitamos el ruido de las tiendas masivas. Aquí solo encontrás lo que realmente vale la pena tener.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-brand-champagne font-serif italic text-xl">2</div>
                  <div>
                    <h4 className="text-lg font-medium mb-2">Asesoramiento Real</h4>
                    <p className="text-white/60 text-sm leading-relaxed">Detrás del chat hay personas que saben de joyería, no bots. Te ayudamos a elegir según tu estilo y medida.</p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-brand-champagne font-serif italic text-xl">3</div>
                  <div>
                    <h4 className="text-lg font-medium mb-2">Calidad que Perdura</h4>
                    <p className="text-white/60 text-sm leading-relaxed">Plata 925 con terminaciones artesanales. Joyería con historia desde 1957 en Nordelta.</p>
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
              { step: "01", title: "Elegí tu favorito", desc: "Explorá la cápsula y seleccioná el modelo que más te represente." },
              { step: "02", title: "Consultanos", desc: "Escribinos por WhatsApp. Te ayudamos con la medida y disponibilidad." },
              { step: "03", title: "Recibí tu joya", desc: "Coordinamos el pago y envío a cualquier punto del país." }
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

      {/* --- SECCIÓN 6: MEDIDAS / STOCK --- */}
      <section className="py-20 px-6 bg-[#F9F8F6] border-y border-brand-champagne/10">
        <div className="container mx-auto max-w-3xl bg-white p-10 md:p-16 rounded-3xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-10 items-center">
            <div className="w-20 h-20 bg-brand-ivory rounded-full flex items-center justify-center flex-shrink-0">
              <Ruler className="w-8 h-8 text-brand-taupe" />
            </div>
            <div>
              <h2 className="text-2xl font-serif mb-4">¿Dudas con la medida o el stock?</h2>
              <p className="text-brand-taupe text-sm leading-relaxed mb-6">
                No te preocupes. Contamos con modelos en stock inmediato y otros que trabajamos a pedido para asegurar que tu anillo sea perfecto para vos. Si no sabés tu talle, te enviamos una guía práctica para medirlo en casa en segundos.
              </p>
              <div className="flex flex-col items-start gap-2">
                <button 
                  onClick={() => handleWhatsApp()}
                  className="text-brand-charcoal font-semibold text-sm flex items-center gap-2 group"
                >
                  Quiero ayuda para elegir <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[9px] uppercase tracking-widest text-brand-taupe">
                  Respondé 3 preguntas rápidas y seguimos
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 7: RESPALDO --- */}
      <section className="py-24 px-6 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-serif mb-12 text-center">Por qué eligen Rapagnani</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "La atención por WhatsApp fue impecable. Me ayudaron a elegir el talle justo y el envío a Córdoba llegó perfecto.", author: "Lucía M." },
              { text: "Buscaba algo delicado para todos los días y los anillos de esta cápsula son exactamente lo que quería. Calidad increíble.", author: "Martina S." },
              { text: "Compré para un regalo y el asesoramiento me salvó. Quedé súper bien, la presentación es hermosa.", author: "Sofía R." }
            ].map((t, i) => (
              <div key={i} className="bg-brand-ivory p-8 rounded-2xl text-left">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-brand-champagne text-brand-champagne" />)}
                </div>
                <p className="text-sm italic text-brand-charcoal/80 mb-6 leading-relaxed">"{t.text}"</p>
                <p className="text-xs font-bold uppercase tracking-widest text-brand-taupe">— {t.author}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 pt-12 border-t border-brand-champagne/20 flex flex-wrap justify-center gap-12 opacity-50 grayscale">
             <span className="font-serif italic text-xl">Nordelta</span>
             <span className="font-serif italic text-xl">Desde 1957</span>
             <span className="font-serif italic text-xl">Plata 925</span>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 8: FAQ --- */}
      <section className="py-24 px-6 bg-brand-ivory">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-3xl font-serif mb-12 text-center">Preguntas Frecuentes</h2>
          <div className="space-y-2">
            <Accordion title="¿Cómo elijo mi medida?">
              Te enviamos una guía súper simple por WhatsApp para que midas un anillo que ya tengas o el contorno de tu dedo. Es infalible.
            </Accordion>
            <Accordion title="¿Qué pasa si quiero otra medida que no está en stock?">
              Muchos de nuestros modelos se pueden ajustar o realizar a pedido. Consultanos por el modelo que te gustó y te confirmamos tiempos.
            </Accordion>
            <Accordion title="¿Los anillos están todos en stock?">
              Contamos con stock de los modelos más elegidos. Si justo tu medida no está disponible, la podemos fabricar especialmente para vos.
            </Accordion>
            <Accordion title="¿Hacen envíos a todo el país?">
              Sí, enviamos a través de Correo Argentino o Andreani a domicilio o sucursal en toda la Argentina.
            </Accordion>
            <Accordion title="¿Cómo se compra?">
              Una vez que definimos modelo y medida por WhatsApp, te enviamos un link de pago o los datos para transferencia. ¡Es muy simple!
            </Accordion>
            <Accordion title="¿Qué medios de pago tienen?">
              Aceptamos transferencia bancaria (con beneficio), tarjetas de crédito y Mercado Pago.
            </Accordion>
            <Accordion title="¿Cuánto tardan las variantes a pedido?">
              Generalmente entre 7 y 10 días hábiles, pero siempre te confirmamos el plazo exacto antes de que realices la compra.
            </Accordion>
            <Accordion title="¿Me pueden asesorar antes de decidir?">
              ¡Claro! Ese es nuestro fuerte. Queremos que compres algo que ames usar. Escribinos sin compromiso.
            </Accordion>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN 9: CTA FINAL --- */}
      <section className="py-24 px-6 bg-brand-charcoal text-white text-center">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-4xl font-serif mb-6 italic">Encontrá tu próxima pieza favorita.</h2>
          <p className="text-white/60 mb-10 leading-relaxed">
            Estamos del otro lado para ayudarte a elegir el modelo ideal y la medida correcta. Sin vueltas, con criterio.
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
              Te orientamos en 4 pasos antes de WhatsApp
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-6">
            Respondemos de Lunes a Viernes de 10 a 19hs
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
            <a href="https://wa.me/5491169302959" target="_blank" rel="noopener noreferrer">
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
