import { useEffect, useRef, useState } from 'react'
import { categories, creations, siteConfig } from './content'
import type { Category, Creation } from './content'
import './App.css'
import { assetUrl } from './assets'

type Modal = { type: 'creation'; creation: Creation } | { type: 'contact'; creation?: Creation } | null

function Brand({ footer = false }: { footer?: boolean }) {
  return <a className={`brand${footer ? ' brand-footer' : ''}`} href="#inicio" aria-label="Nó Fofo — início"><img src={assetUrl('logo-no-fofo.jpeg')} alt="" width="56" height="56" /><span>Nó Fofo<small>CROCHÊ & AFETO</small></span></a>
}

function CreationVisual({ creation, detail = false }: { creation: Creation; detail?: boolean }) {
  const [failed, setFailed] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = creation.gallery?.length ? creation.gallery : [{ image: creation.image, alt: creation.imageAlt }]
  const photo = photos[detail ? photoIndex : 0]
  function changePhoto(index: number) {
    setPhotoIndex((index + photos.length) % photos.length)
    setFailed(false)
  }
  return <div className={`creation-visual tone-${creation.tone} ${detail ? 'detail-visual' : ''}`}>
    {photo.image && !failed ? <img key={photo.image} className="product-photo" src={assetUrl(photo.image)} alt={photo.alt || creation.name} loading="lazy" onError={() => setFailed(true)} /> : <>
      <div className={`thread-composition motif-${creation.motif}`} aria-hidden="true">{Array.from({ length: 7 }, (_, i) => <i key={i} style={{ '--i': i } as React.CSSProperties} />)}</div>
      <span className="placeholder-caption">{failed ? 'FOTOGRAFIA INDISPONÍVEL' : 'FOTOGRAFIA EM BREVE'}</span>
    </>}
    {creation.provisional && <span className="example-tag">Exemplo de criação</span>}
    {photos.length > 1 && (detail ? <div className="gallery-controls" role="group" aria-label={`Galeria de ${creation.name}`}>
      <button type="button" aria-label="Foto anterior" onClick={() => changePhoto(photoIndex - 1)}>←</button>
      <span role="status" aria-live="polite">Foto {photoIndex + 1} de {photos.length}</span>
      <button type="button" aria-label="Próxima foto" onClick={() => changePhoto(photoIndex + 1)}>→</button>
    </div> : <span className="gallery-badge">Galeria · {photos.length} fotos</span>)}
  </div>
}

function App() {
  const [category, setCategory] = useState<Category>('Todas')
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, setModal] = useState<Modal>(null)
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const draftRef = useRef<HTMLTextAreaElement>(null)
  const visibleCreations = creations.filter(c => category === 'Todas' || c.category === category)
  const isModalOpen = modal !== null
  const whatsapp = siteConfig.whatsappNumber.replace(/\D/g, '')
  const contactAvailable = Boolean(whatsapp || siteConfig.email)
  const whatsappDisplay = whatsapp.replace(/^55(\d{2})(\d{4,5})(\d{4})$/, '($1) $2-$3')
  const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent('Olá, Anaile! Gostaria de conversar sobre uma encomenda.')}`

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isModalOpen && !dialog.open) { dialog.showModal(); document.body.style.overflow = 'hidden' }
    if (!isModalOpen && dialog.open) { dialog.close(); document.body.style.overflow = '' }
    return () => { document.body.style.overflow = '' }
  }, [isModalOpen])

  useEffect(() => {
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && menuOpen) { setMenuOpen(false); menuRef.current?.focus() }
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [menuOpen])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target) }
    }), { threshold: 0.08 })
    document.querySelectorAll('[data-reveal]').forEach(element => {
      element.classList.add('will-reveal'); observer.observe(element)
    })
    return () => observer.disconnect()
  }, [])

  function openContact(creation?: Creation) {
    setCopied(false); setCopyError(false)
    setDraft(creation ? `Olá, Anaile! Gostaria de conversar sobre uma criação na categoria ${creation.category}, inspirada em “${creation.name}”. Minha ideia é: ` : 'Olá, Anaile! Quero transformar uma ideia em uma peça de crochê. Minha ideia é: ')
    setModal({ type: 'contact', creation })
    setMenuOpen(false)
  }

  async function copyDraft() {
    setCopyError(false)
    try { await navigator.clipboard.writeText(draft); setCopied(true) }
    catch { setCopyError(true); draftRef.current?.focus(); draftRef.current?.select() }
  }

  return <>
    <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
    <header className="site-header" id="inicio">
      <Brand />
      <button ref={menuRef} type="button" className="menu-toggle" aria-expanded={menuOpen} aria-controls="main-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Fechar' : 'Menu'} <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span></button>
      <nav id="main-navigation" className={menuOpen ? 'menu-open' : ''} aria-label="Navegação principal">
        <a href="#criacao" onClick={() => setMenuOpen(false)}>Criações</a><a href="#encomenda" onClick={() => setMenuOpen(false)}>Como encomendar</a><a className="mobile-contact" href="#contato" onClick={() => setMenuOpen(false)}>Contato</a>
      </nav>
      <a className="button header-cta" href={whatsapp ? whatsappUrl : "#contato"} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noopener noreferrer" : undefined}>{whatsapp ? "Conversar no WhatsApp" : "Vamos conversar"} <span aria-hidden="true">↗</span></a>
    </header>
    <main id="conteudo">
      <section className="hero section-wrap" aria-labelledby="hero-heading">
        <div className="hero-copy"><p className="eyebrow"><span className="tiny-star" aria-hidden="true">✳</span> PEQUENOS NÓS. GRANDES AFETOS.</p><h1 id="hero-heading">Feito de fios.<br />Cheio de <em>afeto.</em></h1><p className="hero-description">Crochê e amigurumis feitos à mão em Campo Grande, MS. Peças para presentear, decorar e guardar pertinho.</p><a className="button primary" href="#criacao">Encontre seu próximo carinho <span aria-hidden="true">↗</span></a><div className="hero-footnote"><span className="small-line" />Feito à mão, no tempo do cuidado.</div></div>
        <div className="hero-art"><div className="orbit orbit-one" aria-hidden="true" /><div className="orbit orbit-two" aria-hidden="true" /><span className="art-caption"></span><div className="logo-disc"><img src={assetUrl('logo-no-fofo.jpeg')} alt="Nó Fofo: um coração feito de fios" width="1254" height="1254" fetchPriority="high" /></div><span className="art-note">um fio de carinho<br /><em>feito só para você</em></span><span className="art-star" aria-hidden="true">✳</span><span className="art-index">CADA PONTO, UMA HISTÓRIA<br />FEITO À MÃO, COM CALMA</span></div>
      </section>
      <div className="ribbon" aria-hidden="true"><span>Um ponto de carinho</span><b>✳</b><span>Um jeito de abraçar</span><b>✳</b><span>Um presente com história</span><b>✳</b><span>Um ponto de carinho</span></div>
      <section id="criacao" className="section-wrap portfolio" aria-labelledby="portfolio-heading">
        <div data-reveal><p className="eyebrow">NOSSAS CRIAÇÕES</p><div className="section-heading"><h2 id="portfolio-heading">Afeto em <em>cada ponto.</em></h2><p>Amigurumis, acessórios e decoração em crochê.<br />Conheça as peças e inspire sua encomenda.</p></div></div>
        <div className="catalog-toolbar"><div className="filters" role="group" aria-label="Filtrar criações por categoria">{categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div><span className="results-count" role="status">{visibleCreations.length} {visibleCreations.length === 1 ? 'criação' : 'criações'}</span></div>
        <p className="demo-note">Conheça nossas peças feitas à mão. Abra cada criação para ver os detalhes e se inspirar na sua encomenda.</p>
        <div className="creation-grid" key={category}>{visibleCreations.map((creation, index) => <article className="creation-card" key={creation.id} style={{ '--order': index } as React.CSSProperties}><button type="button" className="creation-button" aria-label={`Ver detalhes de ${creation.name}`} onClick={() => setModal({ type: 'creation', creation })}><CreationVisual creation={creation} /><div className="creation-meta"><div><p className="creation-category">{creation.category}</p><h3>{creation.name}</h3></div><span className="circle-arrow" aria-hidden="true">↗</span></div><p className="creation-description">{creation.description}</p><span className="card-details">Ver detalhes <span aria-hidden="true">↗</span></span></button></article>)}</div>
        {visibleCreations.length === 0 && <p className="empty-state">Novos pontos estão a caminho. <button onClick={() => setCategory('Todas')}>Ver todas as criações</button></p>}
        <div className="catalog-footer"><span>Imaginou algo diferente?</span><button type="button" className="text-link button contact-cta-main" rel='noopener noreferreronClick' onClick={() => openContact()}>Vamos criar do seu jeito <span aria-hidden="true">↗</span></button></div>
      </section>
      <section id="encomenda" className="order-section" aria-labelledby="order-heading"><div className="section-wrap order-inner"><div data-reveal><p className="eyebrow">DO PRIMEIRO OI AO ÚLTIMO PONTO</p><div className="section-heading"><h2 id="order-heading">Sua ideia.<br /><em>Nossos pontos.</em></h2><p>Encomende seu crochê personalizado em Campo Grande, MS. Converse sobre a peça, as cores, o prazo e a forma de entrega pelo WhatsApp.</p></div></div><ol className="steps">{[
        ['A gente conversa', 'Conte sua ideia, para quem é a peça e o que a torna especial. Pode trazer referências e suas cores favoritas.'],
        ['Cada detalhe combina', 'Definimos possibilidades, materiais, valor, prazo e entrega antes de confirmar a encomenda.'],
        ['O carinho ganha forma', 'Com os detalhes aprovados, começa a criação. É o tempo de transformar os fios em algo seu.'],
        ['Pronto para fazer sorrir', 'A peça é finalizada e segue para você, conforme a forma de entrega combinada.'],
      ].map(([title, text], i) => <li key={title} data-reveal><span className="step-number">0{i + 1}</span><h3>{title}</h3><p>{text}</p></li>)}</ol><p className="order-note">Cada peça tem seu tempo. Disponibilidade, valores e prazos são combinados individualmente.</p></div></section>
      <section id="contato" className="contact-section" aria-labelledby="contact-heading">
        <div className="section-wrap contact-inner" data-reveal>
          <h2 id="contact-heading">
            Qual carinho vamos
            <br />
            <em>criar juntos?</em>
          </h2>
          <p>Crochê feito à mão em Campo Grande, Mato Grosso do Sul.<br />Para presentear alguém ou simplesmente para você.</p>
          {whatsapp ?
            <a className="button contact-cta" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              Encomendar pelo WhatsApp
              <span aria-hidden="true">
                ↗
              </span>
            </a>
            : <button className="button contact-cta" type="button" onClick={() => openContact()}>
              Planejar minha encomenda
              <span aria-hidden="true">
                ↗
              </span>
            </button>}
          <div className="contact-channels">
            {whatsapp ?
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                WhatsApp {whatsappDisplay} ↗
              </a>
              : contactAvailable ?
                <span>Vamos conversar sobre sua ideia</span>
                : <span>
                  Canais de contato em preparação
                </span>}
            {siteConfig.instagramUrl && <>
              <span className="channel-separator" aria-hidden="true">
                ·
              </span>
              <a href={siteConfig.instagramUrl} target="_blank" rel="noopener noreferrer">
                Acompanhe no Instagram ↗
              </a>
            </>}
          </div>
          <span className="contact-star" aria-hidden="true">✳</span></div></section>
    </main>
    <footer className="section-wrap footer"><Brand footer /><p>Pequenos nós, grandes afetos.</p><a href="#inicio">Voltar ao início <span aria-hidden="true">↑</span></a><div className="footer-bottom"><span>© {new Date().getFullYear()} Nó Fofo</span><span>Feito de fios. Cheio de afeto.</span></div></footer>
    <dialog ref={dialogRef} className={`detail-dialog ${modal?.type === 'contact' ? 'contact-dialog' : ''}`} aria-labelledby="dialog-title" onCancel={() => setModal(null)} onClose={() => setModal(null)} onClick={event => { if (event.target === event.currentTarget) { const r = event.currentTarget.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) setModal(null) } }}>
      <button type="button" className="close-dialog" aria-label="Fechar detalhes" onClick={() => setModal(null)}>×</button>
      {modal?.type === 'creation' && <div className="detail-layout"><CreationVisual key={modal.creation.id} creation={modal.creation} detail /><div className="detail-copy"><p className="eyebrow">{modal.creation.category}</p><h2 id="dialog-title">{modal.creation.name}</h2><p>{modal.creation.description}</p><div className="detail-note"><span>Vamos imaginar juntos</span><p>{modal.creation.note}</p></div>{modal.creation.provisional && <p className="provisional-note">Exemplo demonstrativo. Nome, descrição e composição visual provisórios; não representam uma peça real disponível.</p>}<button className="button primary" type="button" onClick={() => openContact(modal.creation)}>Tenho uma ideia assim <span aria-hidden="true">↗</span></button></div></div>}
      {modal?.type === 'contact' && <div className="contact-dialog-content"><p className="eyebrow">UM PRIMEIRO PONTO</p><h2 id="dialog-title">Vamos dar forma<br /><em>à sua ideia?</em></h2><p>{whatsapp ? 'Conte o que você imagina. Sua mensagem será aberta no WhatsApp para você revisar e enviar.' : contactAvailable ? 'Conte o que você imagina. Sua mensagem será aberta no canal de contato para você revisar e enviar.' : 'Nossos canais de contato estarão disponíveis em breve. Por enquanto, você pode preparar e copiar sua ideia para guardar com você.'}</p><label htmlFor="order-draft">Sua ideia de encomenda</label><textarea ref={draftRef} id="order-draft" value={draft} rows={5} onChange={e => { setDraft(e.target.value); setCopied(false); setCopyError(false) }} /><p className="draft-hint">Que peça você imagina? Quais cores? Existe uma data especial?</p><div className="draft-actions">{whatsapp ? <a className="button primary" href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(draft)}`} target="_blank" rel="noopener noreferrer">Conversar no WhatsApp ↗</a> : siteConfig.email ? <a className="button primary" href={`mailto:${siteConfig.email}?subject=${encodeURIComponent('Uma ideia para a Nó Fofo')}&body=${encodeURIComponent(draft)}`}>Abrir meu e-mail ↗</a> : null}<button className={`button ${contactAvailable ? '' : 'primary'}`} disabled={!draft.trim()} type="button" onClick={copyDraft}>{copied ? 'Ideia copiada ✓' : 'Copiar minha ideia'}</button></div><p className="draft-status" role="status">{copied ? 'Copiado! Guarde o texto onde preferir. Nenhuma mensagem foi enviada.' : copyError ? 'Não foi possível copiar automaticamente. O texto está selecionado para você copiar manualmente.' : 'Este rascunho fica apenas nesta página. Nenhuma encomenda é confirmada aqui.'}</p></div>}
    </dialog>
  </>
}
export default App
