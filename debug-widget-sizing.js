// 🔍 FLOWISE WIDGET SIZING & POSITIONING DEBUG SCRIPT
// Browser console'da çalıştır: copy-paste yap ve Enter'a bas

console.log("🔍 Flowise Widget Debug Başlıyor...");

// 1. Widget ana container'ı bul
const flowiseWidget = document.querySelector('flowise-chatbot') || 
                     document.querySelector('flowise-fullchatbot') ||
                     document.querySelector('[class*="chatbot"]');

if (!flowiseWidget) {
  console.error("❌ Flowise widget bulunamadı!");
} else {
  console.log("✅ Widget bulundu:", flowiseWidget);
  
  // Widget ana boyutları
  const widgetRect = flowiseWidget.getBoundingClientRect();
  console.log("📐 Widget Boyutları:", {
    width: widgetRect.width,
    height: widgetRect.height,
    top: widgetRect.top,
    left: widgetRect.left,
    right: widgetRect.right,
    bottom: widgetRect.bottom
  });
  
  // Widget computed styles
  const widgetStyles = window.getComputedStyle(flowiseWidget);
  console.log("🎨 Widget CSS Styles:", {
    display: widgetStyles.display,
    position: widgetStyles.position,
    width: widgetStyles.width,
    height: widgetStyles.height,
    maxWidth: widgetStyles.maxWidth,
    maxHeight: widgetStyles.maxHeight,
    transform: widgetStyles.transform,
    overflow: widgetStyles.overflow
  });
}

// 2. Shadow DOM içine gir
let shadowRoot = null;
if (flowiseWidget && flowiseWidget.shadowRoot) {
  shadowRoot = flowiseWidget.shadowRoot;
  console.log("🌟 Shadow DOM bulundu");
} else if (flowiseWidget) {
  // Fallback: normal DOM
  shadowRoot = flowiseWidget;
  console.log("📄 Normal DOM kullanılıyor");
}

if (shadowRoot) {
  // Chat container'ı bul (ana flex container)
  const mainContainer = shadowRoot.querySelector('.flex.flex-col.w-full.flex-1.min-h-0.overflow-hidden') ||
                       shadowRoot.querySelector('[class*="flex"][class*="flex-col"]') ||
                       shadowRoot.querySelector('div[class*="flex-1"]');
  
  if (mainContainer) {
    console.log("✅ Main Container bulundu:", mainContainer);
    
    const containerRect = mainContainer.getBoundingClientRect();
    const containerStyles = window.getComputedStyle(mainContainer);
    
    console.log("📐 Main Container Boyutları:", {
      width: containerRect.width,
      height: containerRect.height,
      top: containerRect.top,
      left: containerRect.left
    });
    
    console.log("🎨 Main Container CSS:", {
      display: containerStyles.display,
      flexDirection: containerStyles.flexDirection,
      width: containerStyles.width,
      height: containerStyles.height,
      maxWidth: containerStyles.maxWidth,
      maxHeight: containerStyles.maxHeight,
      padding: containerStyles.padding,
      margin: containerStyles.margin,
      overflow: containerStyles.overflow
    });
    
    // Chat mesajları container'ını bul (overflow-y-auto olan)
    const messagesContainer = mainContainer.querySelector('.flex-1.overflow-y-auto') ||
                            mainContainer.querySelector('[class*="flex-1"][class*="overflow-y-auto"]') ||
                            mainContainer.children[0]; // İlk child messages container olmalı
    
    if (messagesContainer) {
      console.log("✅ Messages Container bulundu:", messagesContainer);
      
      const msgRect = messagesContainer.getBoundingClientRect();
      const msgStyles = window.getComputedStyle(messagesContainer);
      
      console.log("📐 Messages Container Boyutları:", {
        width: msgRect.width,
        height: msgRect.height,
        scrollHeight: messagesContainer.scrollHeight,
        clientHeight: messagesContainer.clientHeight
      });
      
      console.log("🎨 Messages Container CSS:", {
        display: msgStyles.display,
        flex: msgStyles.flex,
        width: msgStyles.width,
        height: msgStyles.height,
        maxWidth: msgStyles.maxWidth,
        maxHeight: msgStyles.maxHeight,
        padding: msgStyles.padding,
        margin: msgStyles.margin,
        overflow: msgStyles.overflow,
        overflowY: msgStyles.overflowY
      });
      
      // Host message'ları bul
      const hostMessages = messagesContainer.querySelectorAll('.host-container');
      console.log(`📝 ${hostMessages.length} host message bulundu`);
      
      hostMessages.forEach((msg, index) => {
        const msgRect = msg.getBoundingClientRect();
        const msgStyles = window.getComputedStyle(msg);
        
        console.log(`📨 Host Message ${index + 1}:`, {
          width: msgRect.width,
          height: msgRect.height,
          display: msgStyles.display,
          flexDirection: msgStyles.flexDirection,
          gap: msgStyles.gap,
          marginLeft: msgStyles.marginLeft,
          paddingLeft: msgStyles.paddingLeft
        });
        
        // Avatar'ı bul
        const avatar = msg.querySelector('figure[data-testid="default-avatar"]') ||
                      msg.querySelector('[class*="avatar"]') ||
                      msg.children[0];
        
        if (avatar) {
          const avatarRect = avatar.getBoundingClientRect();
          const avatarStyles = window.getComputedStyle(avatar);
          
          console.log(`🤖 Avatar ${index + 1}:`, {
            width: avatarRect.width,
            height: avatarRect.height,
            marginRight: avatarStyles.marginRight,
            marginLeft: avatarStyles.marginLeft,
            flexShrink: avatarStyles.flexShrink
          });
        }
        
        // Message bubble'ı bul
        const bubble = msg.querySelector('[data-testid="host-bubble"]') ||
                      msg.querySelector('.prose') ||
                      msg.querySelector('span');
        
        if (bubble) {
          const bubbleRect = bubble.getBoundingClientRect();
          const bubbleStyles = window.getComputedStyle(bubble);
          
          console.log(`💬 Message Bubble ${index + 1}:`, {
            width: bubbleRect.width,
            height: bubbleRect.height,
            maxWidth: bubbleStyles.maxWidth,
            minWidth: bubbleStyles.minWidth,
            padding: bubbleStyles.padding,
            marginLeft: bubbleStyles.marginLeft,
            display: bubbleStyles.display,
            boxSizing: bubbleStyles.boxSizing
          });
        }
      });
    }
  }
  
  // Input container'ı bul (flex-shrink-0 olan)
  const inputContainer = shadowRoot.querySelector('[data-testid="input"]') ||
                        shadowRoot.querySelector('.chatbot-input') ||
                        shadowRoot.querySelector('[class*="flex-shrink-0"]');
  
  if (inputContainer) {
    console.log("✅ Input Container bulundu:", inputContainer);
    
    const inputRect = inputContainer.getBoundingClientRect();
    const inputStyles = window.getComputedStyle(inputContainer);
    
    console.log("📝 Input Container:", {
      width: inputRect.width,
      height: inputRect.height,
      display: inputStyles.display,
      padding: inputStyles.padding,
      minHeight: inputStyles.minHeight,
      maxWidth: inputStyles.maxWidth,
      boxSizing: inputStyles.boxSizing
    });
    
    // Textarea elementini bul
    const textarea = inputContainer.querySelector('textarea');
    if (textarea) {
      const textareaRect = textarea.getBoundingClientRect();
      const textareaStyles = window.getComputedStyle(textarea);
      
      console.log("📝 Textarea Element:", {
        width: textareaRect.width,
        height: textareaRect.height,
        flex: textareaStyles.flex,
        maxWidth: textareaStyles.maxWidth,
        boxSizing: textareaStyles.boxSizing
      });
    }
  }
}

// 3. Viewport bilgileri
console.log("🖥️ Viewport Bilgileri:", {
  width: window.innerWidth,
  height: window.innerHeight,
  devicePixelRatio: window.devicePixelRatio
});

// 4. Widget'ın hangi CSS class'ları kullandığını göster
if (flowiseWidget) {
  console.log("🏷️ Widget CSS Classes:", Array.from(flowiseWidget.classList));
  
  if (shadowRoot && shadowRoot !== flowiseWidget) {
    const allElements = shadowRoot.querySelectorAll('*');
    const classUsage = {};
    
    allElements.forEach(el => {
      Array.from(el.classList).forEach(cls => {
        classUsage[cls] = (classUsage[cls] || 0) + 1;
      });
    });
    
    console.log("📊 En çok kullanılan CSS classes:", 
      Object.entries(classUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
    );
  }
}

// 5. Lead Capture Form Debugging
if (shadowRoot) {
  // Search for lead form container by class or data-testid
  const leadForm = shadowRoot.querySelector('.lead-capture-container') ||
                   shadowRoot.querySelector('[data-testid="host-bubble"]');
  if (leadForm) {
    console.log('🟢 Lead Capture Form bulundu:', leadForm);
    const leadRect = leadForm.getBoundingClientRect();
    const leadStyles = window.getComputedStyle(leadForm);
    console.log('📐 Lead Form Boyutları:', {
      width: leadRect.width,
      height: leadRect.height,
      top: leadRect.top,
      left: leadRect.left,
      right: leadRect.right,
      bottom: leadRect.bottom
    });
    console.log('🎨 Lead Form CSS:', {
      display: leadStyles.display,
      position: leadStyles.position,
      width: leadStyles.width,
      height: leadStyles.height,
      margin: leadStyles.margin,
      padding: leadStyles.padding,
      border: leadStyles.border,
      boxSizing: leadStyles.boxSizing,
      background: leadStyles.background
    });
    // Print parent and ancestor context
    let parent = leadForm.parentElement;
    let ancestry = [];
    while (parent && ancestry.length < 5) {
      ancestry.push({
        tag: parent.tagName,
        class: parent.className,
        id: parent.id
      });
      parent = parent.parentElement;
    }
    console.log('🔗 Lead Form Parent/Ancestry:', ancestry);
    // Print children for structure
    console.log('🧩 Lead Form Children:', Array.from(leadForm.children));
  } else {
    console.warn('🟡 Lead Capture Form (.lead-capture-container or [data-testid="host-bubble"]) bulunamadı!');
  }
}

// 6. Overflow ve Scroll Detayları
console.log("🔍 Overflow & Scroll Analizi:");

if (shadowRoot) {
  // Tüm elementlerin overflow durumunu kontrol et
  const allElements = shadowRoot.querySelectorAll('*');
  let overflowElements = [];
  
  allElements.forEach((el, index) => {
    const rect = el.getBoundingClientRect();
    const styles = window.getComputedStyle(el);
    
    // Parent container sınırlarını aş elementleri bul
    const parent = el.parentElement;
    if (parent) {
      const parentRect = parent.getBoundingClientRect();
      
      // Sağa taşma kontrol
      if (rect.right > parentRect.right + 1) { // 1px tolerance
        overflowElements.push({
          element: el,
          issue: 'right-overflow',
          elementRight: rect.right,
          parentRight: parentRect.right,
          overflow: rect.right - parentRect.right,
          elementInfo: `${el.tagName}.${el.className}`,
          styles: {
            width: styles.width,
            maxWidth: styles.maxWidth,
            marginRight: styles.marginRight,
            paddingRight: styles.paddingRight,
            borderRight: styles.borderRight,
            boxSizing: styles.boxSizing,
            overflow: styles.overflow,
            overflowX: styles.overflowX
          }
        });
      }
      
      // Alta taşma kontrol
      if (rect.bottom > parentRect.bottom + 1) {
        overflowElements.push({
          element: el,
          issue: 'bottom-overflow',
          elementBottom: rect.bottom,
          parentBottom: parentRect.bottom,
          overflow: rect.bottom - parentRect.bottom,
          elementInfo: `${el.tagName}.${el.className}`,
          styles: {
            height: styles.height,
            maxHeight: styles.maxHeight,
            marginBottom: styles.marginBottom,
            paddingBottom: styles.paddingBottom,
            borderBottom: styles.borderBottom,
            boxSizing: styles.boxSizing,
            overflow: styles.overflow,
            overflowY: styles.overflowY
          }
        });
      }
    }
  });
  
  if (overflowElements.length > 0) {
    console.log("⚠️ OVERFLOW SORUNLARI BULUNDU:");
    overflowElements.forEach((item, index) => {
      console.log(`${index + 1}. ${item.issue.toUpperCase()}:`, {
        element: item.element,
        elementInfo: item.elementInfo,
        overflow: `${item.overflow.toFixed(2)}px`,
        styles: item.styles
      });
    });
  } else {
    console.log("✅ Overflow sorunu bulunamadı");
  }
}

// 7. Viewport ve Widget Pozisyon Analizi
console.log("📍 Pozisyon Analizi:");

if (flowiseWidget) {
  const widgetRect = flowiseWidget.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  console.log("🖥️ Widget vs Viewport:", {
    widgetRight: widgetRect.right,
    viewportWidth: viewportWidth,
    rightOverflow: widgetRect.right > viewportWidth ? widgetRect.right - viewportWidth : 0,
    widgetBottom: widgetRect.bottom,
    viewportHeight: viewportHeight,
    bottomOverflow: widgetRect.bottom > viewportHeight ? widgetRect.bottom - viewportHeight : 0
  });
  
  // Shadow root'taki ana container'ları kontrol et
  if (shadowRoot) {
    const botContainer = shadowRoot.querySelector('[part="bot"]') || 
                        shadowRoot.querySelector('.fixed.rounded-lg') ||
                        shadowRoot.querySelector('div[style*="position: fixed"]');
    
    if (botContainer) {
      const botRect = botContainer.getBoundingClientRect();
      const botStyles = window.getComputedStyle(botContainer);
      
      console.log("🤖 Bot Container Analizi:", {
        rect: {
          width: botRect.width,
          height: botRect.height,
          right: botRect.right,
          bottom: botRect.bottom
        },
        styles: {
          width: botStyles.width,
          height: botStyles.height,
          maxWidth: botStyles.maxWidth,
          maxHeight: botStyles.maxHeight,
          right: botStyles.right,
          bottom: botStyles.bottom,
          transform: botStyles.transform,
          position: botStyles.position,
          zIndex: botStyles.zIndex
        },
        viewportCheck: {
          rightOverflow: botRect.right > viewportWidth ? botRect.right - viewportWidth : 0,
          bottomOverflow: botRect.bottom > viewportHeight ? botRect.bottom - viewportHeight : 0
        }
      });
    }
  }
}

// 8. Box Model Detay Analizi
console.log("📦 Box Model Analizi:");

if (shadowRoot) {
  // Ana container'ların box model detayları
  const mainContainers = [
    shadowRoot.querySelector('.flowise-widget-container'),
    shadowRoot.querySelector('.flex.flex-col.w-full.flex-1.min-h-0.overflow-hidden'),
    shadowRoot.querySelector('.flex-1.overflow-y-auto'),
    shadowRoot.querySelector('[data-testid="input"]')
  ].filter(Boolean);
  
  mainContainers.forEach((container, index) => {
    if (container) {
      const rect = container.getBoundingClientRect();
      const styles = window.getComputedStyle(container);
      
      console.log(`📦 Container ${index + 1} Box Model:`, {
        element: container,
        dimensions: {
          width: rect.width,
          height: rect.height,
          clientWidth: container.clientWidth,
          scrollWidth: container.scrollWidth,
          offsetWidth: container.offsetWidth
        },
        computed: {
          width: styles.width,
          height: styles.height,
          minWidth: styles.minWidth,
          maxWidth: styles.maxWidth,
          minHeight: styles.minHeight,
          maxHeight: styles.maxHeight,
          padding: styles.padding,
          margin: styles.margin,
          border: styles.border,
          boxSizing: styles.boxSizing
        },
        overflow: {
          overflow: styles.overflow,
          overflowX: styles.overflowX,
          overflowY: styles.overflowY,
          scrollable: container.scrollWidth > container.clientWidth || container.scrollHeight > container.clientHeight
        }
      });
    }
  });
}

console.log("\n🔍 OVERFLOW VE TAŞMA ANALİZİ:");

function analyzeElementOverflow(element, name) {
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  const parent = element.parentElement;
  const parentRect = parent ? parent.getBoundingClientRect() : null;
  
  const analysis = {
    element: name,
    dimensions: {
      clientWidth: element.clientWidth,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      scrollHeight: element.scrollHeight,
      offsetWidth: element.offsetWidth,
      offsetHeight: element.offsetHeight,
      boundingWidth: rect.width,
      boundingHeight: rect.height
    },
    position: {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom
    },
    styles: {
      boxSizing: styles.boxSizing,
      overflow: styles.overflow,
      overflowX: styles.overflowX,
      overflowY: styles.overflowY,
      width: styles.width,
      maxWidth: styles.maxWidth,
      minWidth: styles.minWidth,
      margin: styles.margin,
      padding: styles.padding,
      border: styles.border
    },
    overflow: {
      horizontal: element.scrollWidth > element.clientWidth,
      vertical: element.scrollHeight > element.clientHeight,
      contentOverflowsContainer: false
    }
  };
  
  if (parentRect) {
    analysis.parentRelation = {
      exceedsRight: rect.right > parentRect.right,
      exceedsBottom: rect.bottom > parentRect.bottom,
      exceedsLeft: rect.left < parentRect.left,
      exceedsTop: rect.top < parentRect.top,
      rightOverflow: Math.max(0, rect.right - parentRect.right),
      bottomOverflow: Math.max(0, rect.bottom - parentRect.bottom)
    };
    
    analysis.overflow.contentOverflowsContainer = 
      analysis.parentRelation.exceedsRight || 
      analysis.parentRelation.exceedsBottom;
  }
  
  console.log(`📦 ${name}:`, analysis);
  
  // Problematik elementleri highlight et
  if (analysis.overflow.horizontal || analysis.overflow.vertical || analysis.overflow.contentOverflowsContainer) {
    element.style.outline = "2px solid orange";
    element.style.outlineOffset = "-1px";
    console.warn(`⚠️ ${name} - OVERFLOW TESPİT EDİLDİ!`);
    
    if (analysis.parentRelation && analysis.parentRelation.rightOverflow > 0) {
      console.error(`🚨 ${name} - SAĞ TARAFTA ${analysis.parentRelation.rightOverflow.toFixed(1)}px TAŞMA!`);
    }
  }
  
  return analysis;
}

// Ana container'ları analiz et
if (shadowRoot) {
  // Widget container
  const widgetContainer = shadowRoot.querySelector('.flowise-widget-container') ||
                         shadowRoot.querySelector('[style*="position"]');
  if (widgetContainer) {
    analyzeElementOverflow(widgetContainer, "Widget Container");
  }
  
  // Main container
  if (mainContainer) {
    analyzeElementOverflow(mainContainer, "Main Container");
  }
  
  // Messages container
  if (messagesContainer) {
    analyzeElementOverflow(messagesContainer, "Messages Container");
  }
  
  // Input container
  if (inputContainer) {
    analyzeElementOverflow(inputContainer, "Input Container");
  }
  
  // Tüm message container'ları
  const hostMessages = shadowRoot.querySelectorAll('.host-container');
  hostMessages.forEach((msg, index) => {
    analyzeElementOverflow(msg, `Host Message ${index + 1}`);
    
    // Message content
    const messageContent = msg.querySelector('[data-testid="host-bubble"]') ||
                          msg.querySelector('[class*="bubble"]') ||
                          msg.children[1];
    if (messageContent) {
      analyzeElementOverflow(messageContent, `Message Content ${index + 1}`);
    }
  });
  
  // Input elementi
  const textarea = shadowRoot.querySelector('textarea');
  if (textarea) {
    analyzeElementOverflow(textarea, "Textarea");
  }
}

console.log("\n📊 ELEMENT HİYERARŞİSİ:");

function printElementTree(element, depth = 0) {
  if (depth > 4) return;
  
  const indent = "  ".repeat(depth);
  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  const className = element.className || element.tagName.toLowerCase();
  
  let info = `${indent}${element.tagName.toLowerCase()}`;
  if (element.className) info += `.${element.className.split(' ').slice(0, 2).join('.')}`;
  info += ` (${rect.width.toFixed(0)}x${rect.height.toFixed(0)})`;
  
  if (styles.overflow !== 'visible') {
    info += ` [overflow:${styles.overflow}]`;
  }
  
  console.log(info);
  
  // Sadece önemli child'ları göster (çok fazla detay olmasın)
  const children = Array.from(element.children);
  if (children.length <= 5) {
    children.forEach(child => printElementTree(child, depth + 1));
  } else {
    console.log(`${indent}  ... ${children.length} children`);
  }
}

if (shadowRoot && mainContainer) {
  printElementTree(mainContainer);
}

console.log("✅ Detaylı debug tamamlandı!");

// 9. Widget'ı highlight et (görsel debug için)
if (flowiseWidget) {
  flowiseWidget.style.outline = "3px solid red";
  setTimeout(() => {
    flowiseWidget.style.outline = "";
  }, 3000);
  
  // Overflow bulunan elementleri de highlight et
  if (shadowRoot) {
    const allElements = shadowRoot.querySelectorAll('*');
    allElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement;
      if (parent) {
        const parentRect = parent.getBoundingClientRect();
        if (rect.right > parentRect.right + 1) {
          el.style.outline = "2px solid orange";
          setTimeout(() => {
            el.style.outline = "";
          }, 5000);
        }
      }
    });
  }
}
