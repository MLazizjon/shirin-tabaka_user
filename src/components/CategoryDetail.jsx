import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './CategoryDetail.css';

// Supabase mijozini import qilamiz
import { supabase } from '../supabase/supabesa'; 

// Logo rasmi
import logoImg from '../assets/images/logo.png'; 

const UI_TEXT = {
  backBtn: { uz: 'Ortga', ru: 'Назад', en: 'Back' },
  itemsCount: { uz: 'ta pozitsiya', ru: 'позиций', en: 'items' },
  currency: { uz: 'soʻm', ru: 'сум', en: 'UZS' },
  closeBtn: { uz: 'Yopish', ru: 'Закрыть', en: 'Close' },
  loading: { uz: 'Yuklanmoqda...', ru: 'Загрузка...', en: 'Loading...' },
  empty: { uz: "Bu kategoriyada hozircha mahsulotlar yo'q.", ru: 'В этой категории пока нет товаров.', en: 'No products in this category yet.' }
};

export default function CategoryDetail({
  category,
  currentLang = 'ru',
  onBack,
  onChangeLang,
}) {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);

  // Modal ochiqligida orqa fon scrollini bloklash
  useEffect(() => {
    document.body.style.overflow = selectedProduct ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedProduct]);

  // Kategoriya o'zgarganda Supabase'dan mahsulotlarni dinamik yuklab olish
  useEffect(() => {
    async function fetchProducts() {
      if (!category) {
        setProductsList([]);
        return;
      }

      setLoading(true);
      const categoryId = category.id || category.slug;

      // Supabase'dagi 'products' jadvalidan 'category_id' bo'yicha filter qilamiz
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId);

      if (error) {
        console.error("Mahsulotlarni yuklashda xatolik:", error);
        setProductsList([]);
      } else {
        setProductsList(data || []);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [category]);

  const handleBackClick = () => {
    if (isLeaving) return;
    setIsLeaving(true);
    setTimeout(() => {
      onBack && onBack();
      setTimeout(() => {
        setIsLeaving(false);
      }, 50);
    }, 450);
  };

  const getCategoryName = (cat) => {
    if (!cat) return '';
    return cat[`name_${currentLang}`] || cat.name?.[currentLang] || cat.name_ru || cat.name?.ru || '';
  };

  const getProductName = (item) => {
    if (!item) return '';
    return item[`name_${currentLang}`] || (typeof item.name === 'object' ? item.name[currentLang] || item.name.ru : item.name) || '';
  };

  const getProductDescription = (item) => {
    if (!item) return '';
    const desc = item[`description_${currentLang}`] || item.description || item.desc;
    if (!desc) {
      return currentLang === 'uz'
        ? 'Tavsif mavjud emas.'
        : currentLang === 'ru'
        ? 'Описание отсутствует.'
        : 'No description available.';
    }
    return typeof desc === 'object' ? desc[currentLang] || desc.ru || '' : desc;
  };

  // Modal oynasi
  const modalContent = selectedProduct && (
    <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
      <div className="product-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="modal-img-wrapper">
          <img
            src={selectedProduct.image || selectedProduct.image_url}
            alt={getProductName(selectedProduct)}
            className="modal-img"
          />
        </div>

        <div className="modal-info-wrapper">
          <h2 className="modal-product-name">{getProductName(selectedProduct)}</h2>
          <p className="modal-product-desc">{getProductDescription(selectedProduct)}</p>

          <div className="modal-footer-row">
            <div className="modal-product-price">
              {Number(selectedProduct.price).toLocaleString()} <span>{UI_TEXT.currency[currentLang]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="category-detail-wrapper fade-in">
      <header className="category-header">
        <button
          type="button"
          className={`menu-btn ${isLeaving ? 'leaving' : ''}`}
          onClick={handleBackClick}
        >
          <span className="menu-btn-circle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18L9 12L15 6" />
            </svg>
          </span>
          <span className="menu-btn-text">{UI_TEXT.backBtn[currentLang]}</span>
        </button>

        <div className="category-header-logo">
          <img src={logoImg} alt="Logo" />
        </div>

        <div className="lang-select-container">
          <button
            type="button"
            className="category-lang-btn"
            onClick={() => {
              sessionStorage.setItem('categoryScrollPosition', window.scrollY);
              sessionStorage.setItem('returnPage', 'category');
              if (onChangeLang) onChangeLang();
            }}
          >
            <span className="lang-code">{currentLang.toUpperCase()}</span>
            <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
      </header>

      <main className="category-main-content">
        <div className="category-banner-card">
          <div className="banner-info">
            <div className="banner-title-row">
              <img
                src={category?.image_url || category?.image}
                alt={getCategoryName(category)}
                className="banner-mini-thumb"
              />
              <div>
                <h1 className="banner-title">{getCategoryName(category)}</h1>
                <span className="banner-count">
                  {productsList.length} {UI_TEXT.itemsCount[currentLang]}
                </span>
              </div>
            </div>
            <p className="banner-desc">
              {currentLang === 'uz' && 'Tanlangan masalliqlardan tayyorlangan sarxill taomlar.'}
              {currentLang === 'ru' && 'Свежие блюда, приготовленные из отборных ингредиентов.'}
              {currentLang === 'en' && 'Fresh dishes made from selected high-quality ingredients.'}
            </p>
          </div>

          <div className="banner-bg-image">
            <img src={category?.image_url || category?.image} alt="" />
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginTop: '40px' }}>
            {UI_TEXT.loading[currentLang]}
          </p>
        ) : productsList.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', fontSize: '18px', marginTop: '40px' }}>
            {UI_TEXT.empty[currentLang]}
          </p>
        ) : (
          <div className="products-grid">
            {productsList.map((item) => (
              <div
                key={item.id}
                className="product-card"
                onClick={() => setSelectedProduct(item)}
              >
                <div className="product-img-wrapper">
                  <img
                    src={item.image || item.image_url}
                    alt={getProductName(item)}
                    className="product-img"
                  />
                </div>
                <div className="product-details">
                  <h3 className="product-name">{getProductName(item)}</h3>
                  <div className="product-price">
                    {Number(item.price).toLocaleString()}
                    <span> {UI_TEXT.currency[currentLang]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedProduct && createPortal(modalContent, document.body)}
    </div>
  );
}