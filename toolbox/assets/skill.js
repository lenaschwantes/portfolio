// página da skill: botão de copiar o comando de instalação
document.querySelectorAll('[data-cmd]').forEach(b => b.addEventListener('click', () => TB.copy(b.dataset.cmd, I18N.t('toast.copied'))));
