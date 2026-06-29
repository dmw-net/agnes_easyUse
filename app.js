/**
 * AI Genesis - 主应用脚本
 * 实现交互功能和用户体验优化
 */

// 平滑滚动到指定板块
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const headerOffset = 80; // Header 高度
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Header 滚动效果
function initHeaderScroll() {
    const header = document.getElementById('header');
    if (!header) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // 添加/移除阴影效果
        if (currentScroll > 50) {
            header.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
        } else {
            header.style.boxShadow = 'none';
        }

        lastScroll = currentScroll;
    });
}

// 导航链接高亮
function initNavHighlight() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = ['hero', 'core-features', 'faq'];

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        sections.forEach((sectionId, index) => {
            const section = document.getElementById(sectionId);
            if (!section) return;

            const sectionTop = section.offsetTop - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (currentScroll >= sectionTop && currentScroll < sectionBottom) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLinks[index]) {
                    navLinks[index].classList.add('active');
                }
            }
        });
    });
}

// 按钮磁吸效果
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.cta-btn');

    buttons.forEach(button => {
        button.addEventListener('mousemove', (e) => {
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            button.style.transform = `translateY(-2px) translate(${x * 0.1}px, ${y * 0.1}px)`;
        });

        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
}

// 卡片悬停效果增强
function initCardHoverEffects() {
    const cards = document.querySelectorAll('.feature-card, .sub-feature-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.background = `rgba(255, 255, 255, 0.04)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = 'rgba(255, 255, 255, 0.02)';
        });
    });
}

// FAQ 手风琴效果
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (!question || !answer) return;

        // 初始状态：隐藏答案
        answer.style.maxHeight = '0';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.3s ease';

        question.style.cursor = 'pointer';

        question.addEventListener('click', () => {
            const isOpen = answer.style.maxHeight !== '0';

            // 关闭所有其他项目
            faqItems.forEach(otherItem => {
                const otherAnswer = otherItem.querySelector('.faq-answer');
                if (otherAnswer && otherItem !== item) {
                    otherAnswer.style.maxHeight = '0';
                }
            });

            // 切换当前项目
            if (isOpen) {
                answer.style.maxHeight = '0';
            } else {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

// 滚动动画 - 元素进入视口时触发
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // 观察所有需要动画的元素
    const animatedElements = document.querySelectorAll(
        '.feature-card, .sub-feature-card, .faq-item, .section-title'
    );

    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });
}

// 占位符动画效果
function initPlaceholderAnimations() {
    const placeholders = document.querySelectorAll('.feature-placeholder');

    placeholders.forEach(placeholder => {
        // 创建渐变流动效果
        let angle = 0;

        function animateGradient() {
            angle = (angle + 1) % 360;
            placeholder.style.background = `linear-gradient(${angle}deg, #2EA7FF, #9381FF, #13DDC4)`;
            requestAnimationFrame(animateGradient);
        }

        // 鼠标悬停时启动动画
        placeholder.addEventListener('mouseenter', () => {
            animateGradient();
        });

        // 鼠标离开时恢复静态渐变
        placeholder.addEventListener('mouseleave', () => {
            if (placeholder.classList.contains('img-placeholder')) {
                placeholder.style.background = 'linear-gradient(135deg, #2EA7FF 0%, #9381FF 100%)';
            } else {
                placeholder.style.background = 'linear-gradient(135deg, #9381FF 0%, #13DDC4 100%)';
            }
        });
    });
}

// 页面加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initNavHighlight();
    initMagneticButtons();
    initCardHoverEffects();
    initFaqAccordion();
    initScrollAnimations();
    initPlaceholderAnimations();

    // 页面加载动画
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// 导出函数供HTML中的onclick调用
window.scrollToSection = scrollToSection;
