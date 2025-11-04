const CONFIG = {
  ENV: (new URLSearchParams(location.search).get('env') || 'prod'),
  WEBHOOKS: {
    test: 'https://automation.workglaze.com/webhook-test/08910fe2-2748-45e2-8abc-68ffb14c098e',
    prod: 'https://automation.workglaze.com/webhook/08910fe2-2748-45e2-8abc-68ffb14c098e',
  },
  HEADSHOT_URL: 'https://raw.githubusercontent.com/NISPUK/Workglaze.com/main/img/Carlo%20Headshot%20with%20Name.png',
  LINKEDIN_URL: 'https://www.linkedin.com/in/DEIN-LINK',
  COMPANY_NAME: 'Workglaze',
  PHONE: '+49 176 62693862'
};

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class SurveyApp {
  constructor() {
    this.sessionId = generateUUID();
    this.currentStepIndex = 0;
    this.answers = {};
    this.webhookQueue = [];
    this.isOnline = navigator.onLine;
    this.answerChangeThrottle = null;
    this.hasStarted = false;
    
    this.steps = [
      { id: 'intro', title: 'Willkommen' },
      { id: 'basisdaten', title: 'Basisdaten' },
      { id: 'einordnung', title: 'Einordnung' },
      { id: 'desktop', title: 'Desktop-Chatbots', conditional: true },
      { id: 'saas', title: 'SaaS-Tools', conditional: true },
      { id: 'automationen', title: 'Automationen', conditional: true },
      { id: 'nonusers', title: 'Nicht-Nutzung', conditional: true },
      { id: 'dienstleister', title: 'Dienstleister' },
      { id: 'abschluss', title: 'Abschluss' }
    ];

    this.setupEventListeners();
    this.render();
    this.sendWebhook('step_view');
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processWebhookQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    window.addEventListener('beforeunload', (e) => {
      if (this.hasStarted && this.getCurrentStep().id !== 'success') {
        this.sendWebhook('abandon', {}, true);
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && this.hasStarted && this.getCurrentStep().id !== 'success') {
        this.sendWebhook('abandon', {}, true);
      }
    });
  }

  getCurrentStep() {
    const visibleSteps = this.getVisibleSteps();
    return visibleSteps[this.currentStepIndex] || this.steps[0];
  }

  getVisibleSteps() {
    const genaiUse = this.answers.genai_use || [];
    const visibleSteps = [];

    for (const step of this.steps) {
      if (!step.conditional) {
        visibleSteps.push(step);
      } else {
        if (step.id === 'desktop' && genaiUse.includes('desktop')) {
          visibleSteps.push(step);
        } else if (step.id === 'saas' && genaiUse.includes('saas')) {
          visibleSteps.push(step);
        } else if (step.id === 'automationen' && genaiUse.includes('automationen')) {
          visibleSteps.push(step);
        } else if (step.id === 'nonusers' && genaiUse.includes('none')) {
          visibleSteps.push(step);
        }
      }
    }

    return visibleSteps;
  }

  getProgress() {
    const visibleSteps = this.getVisibleSteps();
    const currentStep = this.getCurrentStep();
    
    if (currentStep.id === 'intro') {
      return {
        current: 0,
        total: visibleSteps.length - 1,
        percent: 0
      };
    }
    
    return {
      current: this.currentStepIndex,
      total: visibleSteps.length - 1,
      percent: Math.round((this.currentStepIndex / (visibleSteps.length - 1)) * 100)
    };
  }

  async sendWebhook(event, answersDelta = {}, useBeacon = false) {
    const step = this.getCurrentStep();
    const payload = {
      event,
      session_id: this.sessionId,
      ts: new Date().toISOString(),
      step_id: step.id,
      progress: this.getProgress(),
      answers_delta: answersDelta,
      meta: {
        user_agent: navigator.userAgent,
        referrer: document.referrer
      }
    };

    if (event === 'step_submit' || event === 'final_submit') {
      payload.all_answers = { ...this.answers };
    }

    const url = CONFIG.WEBHOOKS[CONFIG.ENV];

    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
      return;
    }

    if (!this.isOnline) {
      this.webhookQueue.push({ payload, retries: 0 });
      return;
    }

    await this.sendWithRetry({ payload, retries: 0 });
  }

  async sendWithRetry(item, maxRetries = 5) {
    try {
      const response = await fetch(CONFIG.WEBHOOKS[CONFIG.ENV], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
        keepalive: true
      });

      if (!response.ok && item.retries < maxRetries) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Webhook error:', error);
      
      if (item.retries < maxRetries) {
        item.retries++;
        const delay = Math.min(1000 * Math.pow(2, item.retries), 30000);
        
        setTimeout(() => {
          if (this.isOnline) {
            this.sendWithRetry(item, maxRetries);
          } else {
            this.webhookQueue.push(item);
          }
        }, delay);
      } else {
        this.webhookQueue.push(item);
      }
    }
  }

  async processWebhookQueue() {
    while (this.webhookQueue.length > 0 && this.isOnline) {
      const item = this.webhookQueue.shift();
      await this.sendWithRetry(item);
    }
  }

  handleAnswerChange(key, value) {
    const oldValue = this.answers[key];
    this.answers[key] = value;

    if (this.answerChangeThrottle) {
      clearTimeout(this.answerChangeThrottle);
    }

    this.answerChangeThrottle = setTimeout(() => {
      if (oldValue !== value) {
        this.sendWebhook('answer_change', { [key]: value });
      }
    }, 300);
  }

  validateStep(stepId) {
    const errors = {};

    switch (stepId) {
      case 'basisdaten':
        if (!this.answers.company_url) {
          errors.company_url = 'Bitte geben Sie eine Shop-URL ein.';
        }
        if (!this.answers.hq_in_germany) {
          errors.hq_in_germany = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.industry) {
          errors.industry = 'Bitte wählen Sie eine Branche.';
        }
        if (!this.answers.ecommerce_platform || this.answers.ecommerce_platform.length === 0) {
          errors.ecommerce_platform = 'Bitte wählen Sie mindestens eine Plattform.';
        }
        if (!this.answers.employees) {
          errors.employees = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.revenue) {
          errors.revenue = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.uses_erp) {
          errors.uses_erp = 'Bitte wählen Sie eine Option.';
        }
        if (this.answers.uses_erp === 'yes' && !this.answers.erp_name) {
          errors.erp_name = 'Bitte geben Sie den ERP-Namen ein.';
        }
        break;

      case 'einordnung':
        if (!this.answers.genai_measurable) {
          errors.genai_measurable = 'Bitte wählen Sie eine Option.';
        }
        if (this.answers.genai_champions === undefined || this.answers.genai_champions === '') {
          errors.genai_champions = 'Bitte geben Sie eine Zahl ein.';
        }
        if (!this.answers.genai_understanding) {
          errors.genai_understanding = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.training_received || this.answers.training_received.length === 0) {
          errors.training_received = 'Bitte wählen Sie mindestens eine Option.';
        }
        if (!this.answers.genai_use || this.answers.genai_use.length === 0) {
          errors.genai_use = 'Bitte wählen Sie mindestens eine Option.';
        }
        break;

      case 'desktop':
        if (!this.answers.desktop_llms || this.answers.desktop_llms.length === 0) {
          errors.desktop_llms = 'Bitte wählen Sie mindestens eine Option.';
        }
        if (!this.answers.desktop_use_cases || this.answers.desktop_use_cases.length === 0) {
          errors.desktop_use_cases = 'Bitte wählen Sie mindestens eine Option.';
        }
        if (!this.answers.desktop_quality_change) {
          errors.desktop_quality_change = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.desktop_faster) {
          errors.desktop_faster = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.desktop_has_satisfied) {
          errors.desktop_has_satisfied = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.desktop_has_unsatisfied) {
          errors.desktop_has_unsatisfied = 'Bitte wählen Sie eine Option.';
        }
        break;

      case 'saas':
        if (!this.answers.saas_tools || this.answers.saas_tools.length === 0) {
          errors.saas_tools = 'Bitte wählen Sie mindestens eine Option.';
        }
        if (!this.answers.saas_use_cases || this.answers.saas_use_cases.length === 0) {
          errors.saas_use_cases = 'Bitte wählen Sie mindestens eine Option.';
        }
        if (!this.answers.saas_usage_intensity) {
          errors.saas_usage_intensity = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.saas_has_satisfied) {
          errors.saas_has_satisfied = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.saas_has_unsatisfied) {
          errors.saas_has_unsatisfied = 'Bitte wählen Sie eine Option.';
        }
        break;

      case 'automationen':
        if (!this.answers.automation_software || this.answers.automation_software.length === 0) {
          errors.automation_software = 'Bitte wählen Sie mindestens eine Option.';
        }
        if (!this.answers.automation_agents_deployed) {
          errors.automation_agents_deployed = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.automation_kpis || this.answers.automation_kpis.length === 0) {
          errors.automation_kpis = 'Bitte wählen Sie mindestens eine Option.';
        }
        if (!this.answers.automation_review_frequency) {
          errors.automation_review_frequency = 'Bitte wählen Sie eine Option.';
        }
        if (this.answers.automation_count === undefined || this.answers.automation_count === '') {
          errors.automation_count = 'Bitte geben Sie eine Zahl ein.';
        }
        break;

      case 'nonusers':
        if (!this.answers.nonusers_reasons || this.answers.nonusers_reasons.length === 0) {
          errors.nonusers_reasons = 'Bitte wählen Sie mindestens eine Option.';
        }
        if (!this.answers.nonusers_plan_2026) {
          errors.nonusers_plan_2026 = 'Bitte wählen Sie eine Option.';
        }
        break;

      case 'dienstleister':
        if (!this.answers.provider_hired) {
          errors.provider_hired = 'Bitte wählen Sie eine Option.';
        }
        if (this.answers.provider_hired === 'yes') {
          if (this.answers.provider_duration === undefined || this.answers.provider_duration === '') {
            errors.provider_duration = 'Bitte geben Sie die Dauer ein.';
          }
          if (!this.answers.provider_on_time_budget) {
            errors.provider_on_time_budget = 'Bitte wählen Sie eine Option.';
          }
          if (!this.answers.provider_work_again) {
            errors.provider_work_again = 'Bitte wählen Sie eine Option.';
          }
          if (!this.answers.provider_satisfaction) {
            errors.provider_satisfaction = 'Bitte geben Sie eine Bewertung ab.';
          }
        }
        break;

      case 'abschluss':
        if (!this.answers.has_it_department) {
          errors.has_it_department = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.plan_2026_investment) {
          errors.plan_2026_investment = 'Bitte wählen Sie eine Option.';
        }
        if (!this.answers.report_email) {
          errors.report_email = 'Bitte geben Sie eine E-Mail-Adresse ein.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.answers.report_email)) {
          errors.report_email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        }
        break;
    }

    return errors;
  }

  async handleNext() {
    const currentStep = this.getCurrentStep();
    const errors = this.validateStep(currentStep.id);

    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.remove());
    
    const errorInputs = document.querySelectorAll('.error');
    errorInputs.forEach(el => el.classList.remove('error'));

    if (Object.keys(errors).length > 0) {
      for (const [key, message] of Object.entries(errors)) {
        const input = document.querySelector(`[name="${key}"]`);
        if (input) {
          input.classList.add('error');
          const errorEl = document.createElement('span');
          errorEl.className = 'error-message';
          errorEl.textContent = message;
          errorEl.setAttribute('role', 'alert');
          input.parentElement.appendChild(errorEl);
        }
      }
      
      const firstError = document.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    await this.sendWebhook('step_submit');

    const visibleSteps = this.getVisibleSteps();
    if (this.currentStepIndex < visibleSteps.length - 1) {
      this.currentStepIndex++;
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.sendWebhook('step_view');
    } else {
      await this.submitSurvey();
    }
  }

  handleBack() {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.sendWebhook('step_view');
    }
  }

  async handleStart() {
    this.hasStarted = true;
    await this.sendWebhook('start_click');
    this.currentStepIndex++;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.sendWebhook('step_view');
  }

  async submitSurvey() {
    await this.sendWebhook('final_submit');
    this.currentStepIndex++;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  render() {
    const app = document.getElementById('app');
    const currentStep = this.getCurrentStep();

    if (this.currentStepIndex >= this.getVisibleSteps().length) {
      app.innerHTML = this.renderSuccess();
      return;
    }
    
    let content = '<div class="step-content">';

    switch (currentStep.id) {
      case 'intro':
        content += this.renderIntro();
        break;
      case 'basisdaten':
        content += this.renderBasisdaten();
        break;
      case 'einordnung':
        content += this.renderEinordnung();
        break;
      case 'desktop':
        content += this.renderDesktop();
        break;
      case 'saas':
        content += this.renderSaas();
        break;
      case 'automationen':
        content += this.renderAutomationen();
        break;
      case 'nonusers':
        content += this.renderNonusers();
        break;
      case 'dienstleister':
        content += this.renderDienstleister();
        break;
      case 'abschluss':
        content += this.renderAbschluss();
        break;
    }

    content += '</div>';
    
    app.innerHTML = `<div class="survey-container">${content}</div>`;

    if (currentStep.id !== 'intro') {
      app.innerHTML += `
        <footer class="footer">
          <p>Daten nur zur Auswertung dieser Umfrage. Kein Verkauf. Report per E-Mail.</p>
        </footer>
      `;
    }

    this.attachEventListeners();
  }

  renderIntro() {
    return `
      <div class="intro-header">
        <img src="${CONFIG.HEADSHOT_URL}" alt="Carlo von Workglaze" class="intro-headshot">
        <div class="intro-title-section">
          <div class="survey-label">Umfrage</div>
          <h1>Gen-AI & Automatisierung im deutschen E-Commerce</h1>
        </div>
      </div>
      <div class="intro-text">
  <p>Hi, ich bin Carlo von ${CONFIG.COMPANY_NAME}.</p>
  <p>Wir sind ein dynamisches Team aus drei Leuten mit einer klaren Mission: Wir wollen für deutsche E-Commerce-Unternehmen mit Gen-AI und Automatisierung echte, messbare Ergebnisse erzielen.</p>
  <p>Mit deiner Teilnahme können wir ein klareres Bild der aktuellen Lage zeichnen und Gen-AI in Deutschland voranbringen.</p>
  <p>Sobald genug Antworten gesammelt sind, bekommst du den Report natürlich zugeschickt, damit du besser einschätzen kannst, wo dein Unternehmen gerade steht und deine Strategie für 2026 so datenbasiert wie möglich wird.</p>
  <p>Die Umfrage dauert 5 bis 10 Minuten.</p>
  <p>Vielen Dank im Voraus für deine Teilnahme.</p>
  <p>PS: Am Ende der Umfrage bitten wir dich noch um einen kleinen Gefallen.</p>
</div>
      <div class="button-group">
        <button type="button" class="btn-primary" id="start-btn">
          Umfrage starten
        </button>
      </div>
    `;
  }

  renderBasisdaten() {
    return `
      <h2>Basisdaten</h2>
      
      <div class="form-group">
        <label for="company_url" class="required">Shop-URL</label>
        <input type="text" id="company_url" name="company_url" value="${this.answers.company_url || ''}" placeholder="beispiel.de">
      </div>

      <div class="form-group">
        <label class="required">Hauptsitz in Deutschland?</label>
        <div class="radio-group inline">
          ${this.renderRadio('hq_in_germany', 'yes', 'Ja')}
          ${this.renderRadio('hq_in_germany', 'no', 'Nein')}
        </div>
      </div>

      <div class="form-group">
        <label for="industry" class="required">Branche</label>
        <select id="industry" name="industry">
          <option value="">Bitte wählen...</option>
          ${this.renderOption('industry', 'fashion', 'Fashion')}
          ${this.renderOption('industry', 'beauty', 'Beauty/Kosmetik')}
          ${this.renderOption('industry', 'electronics', 'Elektronik')}
          ${this.renderOption('industry', 'food', 'Food & Beverage')}
          ${this.renderOption('industry', 'home', 'Home & Living')}
          ${this.renderOption('industry', 'sports', 'Sport/Outdoor')}
          ${this.renderOption('industry', 'health', 'Gesundheit')}
          ${this.renderOption('industry', 'pets', 'Tierbedarf')}
          ${this.renderOption('industry', 'other', 'Anderes')}
        </select>
      </div>

      <div class="form-group">
        <label for="ecommerce_platform" class="required">E-Commerce-Plattform</label>
        <select id="ecommerce_platform" name="ecommerce_platform">
          <option value="">Bitte wählen...</option>
          ${this.renderOption('ecommerce_platform', 'shopify', 'Shopify')}
          ${this.renderOption('ecommerce_platform', 'shopware', 'Shopware')}
          ${this.renderOption('ecommerce_platform', 'woocommerce', 'WooCommerce')}
          ${this.renderOption('ecommerce_platform', 'magento', 'Magento/Adobe Commerce')}
          ${this.renderOption('ecommerce_platform', 'bigcommerce', 'BigCommerce')}
          ${this.renderOption('ecommerce_platform', 'salesforce', 'Salesforce Commerce Cloud')}
          ${this.renderOption('ecommerce_platform', 'squarespace', 'Squarespace/Shop')}
          ${this.renderOption('ecommerce_platform', 'custom', 'Eigenentwicklung')}
          ${this.renderOption('ecommerce_platform', 'other', 'Anderes')}
        </select>
      </div>

      <div class="form-group">
        <label for="employees" class="required">Mitarbeitende (FTE)</label>
        <select id="employees" name="employees">
          <option value="">Bitte wählen...</option>
          ${this.renderOption('employees', '1-4', '1–4')}
          ${this.renderOption('employees', '5-10', '5–10')}
          ${this.renderOption('employees', '11-25', '11–25')}
          ${this.renderOption('employees', '26-50', '26–50')}
          ${this.renderOption('employees', '51-100', '51–100')}
          ${this.renderOption('employees', '101-250', '101–250')}
          ${this.renderOption('employees', '251+', '251+')}
        </select>
      </div>

      <div class="form-group">
        <label for="revenue" class="required">Jahresumsatz</label>
        <select id="revenue" name="revenue">
          <option value="">Bitte wählen...</option>
          ${this.renderOption('revenue', '<250k', '< 250.000 €')}
          ${this.renderOption('revenue', '250k-500k', '250.000 – 500.000 €')}
          ${this.renderOption('revenue', '500k-1m', '500.000 € – 1 Mio €')}
          ${this.renderOption('revenue', '1m-2m', '1 – 2 Mio €')}
          ${this.renderOption('revenue', '2m-5m', '2 – 5 Mio €')}
          ${this.renderOption('revenue', '5m-10m', '5 – 10 Mio €')}
          ${this.renderOption('revenue', '10m-25m', '10 – 25 Mio €')}
          ${this.renderOption('revenue', '25m+', '> 25 Mio €')}
        </select>
      </div>

      <div class="form-group">
        <label class="required">Wird ein ERP genutzt?</label>
        <div class="radio-group inline">
          ${this.renderRadio('uses_erp', 'yes', 'Ja')}
          ${this.renderRadio('uses_erp', 'no', 'Nein')}
        </div>
      </div>

      <div class="form-group ${this.answers.uses_erp !== 'yes' ? 'hidden' : ''}" id="erp_name_group">
        <label for="erp_name" class="required">Welches ERP?</label>
        <input type="text" id="erp_name" name="erp_name" value="${this.answers.erp_name || ''}" placeholder="z.B. SAP, Microsoft Dynamics, JTL, Xentral, Odoo">
      </div>

      <div class="button-group">
        <button type="button" class="btn-primary" id="next-btn">Weiter</button>
      </div>
    `;
  }

  renderEinordnung() {
    const genaiUse = this.answers.genai_use || [];
    const isNoneSelected = genaiUse.includes('none');

    return `
      <h2>Einordnung</h2>

      <div class="form-group">
        <label class="required">Ist der Effekt von Gen-AI bei euch über KPIs messbar?</label>
        <div class="radio-group inline">
          ${this.renderRadio('genai_measurable', 'yes', 'Ja')}
          ${this.renderRadio('genai_measurable', 'no', 'Nein')}
        </div>
      </div>

      <div class="form-group ${this.answers.genai_measurable !== 'no' ? 'hidden' : ''}" id="measurable_blocker_group">
        <label for="measurable_blocker">Was verhindert derzeit Messbarkeit? (optional)</label>
        <textarea id="measurable_blocker" name="measurable_blocker" rows="3">${this.answers.measurable_blocker || ''}</textarea>
      </div>

      <div class="form-group">
        <label for="genai_champions" class="required">Wie viele interne Gen-AI-Champions (stark Interessierte) gibt es aktuell?</label>
        <input type="number" id="genai_champions" name="genai_champions" min="0" value="${this.answers.genai_champions || ''}" placeholder="0">
      </div>

      <div class="form-group">
        <label class="required">Wie gut ist das interne Verständnis für Gen-AI?</label>
        <div class="radio-group inline">
          ${this.renderRadio('genai_understanding', 'very_good', 'Sehr gut')}
          ${this.renderRadio('genai_understanding', 'good', 'Gut')}
          ${this.renderRadio('genai_understanding', 'okay', 'Okay')}
          ${this.renderRadio('genai_understanding', 'low', 'Gering')}
          ${this.renderRadio('genai_understanding', 'very_low', 'Sehr gering')}
        </div>
      </div>

      <div class="form-group">
        <label class="required">Welche Schulungen haben Mitarbeitende bereits erhalten?</label>
        <div class="checkbox-group compact">
          ${this.renderCheckbox('training_received', 'internal', 'Interne Schulungen')}
          ${this.renderCheckbox('training_received', 'external', 'Externe Workshops')}
          ${this.renderCheckbox('training_received', 'online', 'Online-Kurse')}
          ${this.renderCheckbox('training_received', 'on_job', 'On-the-Job')}
          ${this.renderCheckbox('training_received', 'none', 'Keine')}
          ${this.renderCheckbox('training_received', 'other', 'Anderes')}
        </div>
      </div>

      <div class="form-group">
        <label class="required">Wie nutzt ihr Gen-AI heute im Unternehmen?</label>
        <div class="checkbox-group">
          ${this.renderCheckbox('genai_use', 'desktop', 'Desktop-Chatbots (z.B. ChatGPT, Perplexity)', isNoneSelected)}
          ${this.renderCheckbox('genai_use', 'saas', 'Spezialisierte Gen-AI SaaS-Tools', isNoneSelected)}
          ${this.renderCheckbox('genai_use', 'automationen', 'Automationen & Workflows (z.B. Make.com, n8n, Zapier)', isNoneSelected)}
          ${this.renderCheckbox('genai_use', 'none', 'Wir nutzen keine Gen-AI')}
        </div>
      </div>

      <div class="button-group">
        <button type="button" class="btn-primary" id="next-btn">Weiter</button>
      </div>
    `;
  }

  renderDesktop() {
    const genaiUse = this.answers.genai_use || [];
    const onlyDesktop = genaiUse.includes('desktop') && !genaiUse.includes('saas') && !genaiUse.includes('automationen');

    return `
      <h2>Desktop-Chatbots</h2>

      <div class="form-group">
        <label class="required">Welche LLMs/Chatbots nutzt ihr?</label>
        <div class="checkbox-group compact">
          ${this.renderCheckbox('desktop_llms', 'chatgpt', 'ChatGPT (OpenAI)')}
          ${this.renderCheckbox('desktop_llms', 'claude', 'Claude (Anthropic)')}
          ${this.renderCheckbox('desktop_llms', 'gemini', 'Gemini (Google)')}
          ${this.renderCheckbox('desktop_llms', 'perplexity', 'Perplexity')}
          ${this.renderCheckbox('desktop_llms', 'other', 'Andere')}
        </div>
      </div>

      <div class="form-group">
        <label class="required">Wofür nutzt ihr Chatbots hauptsächlich?</label>
        <div class="checkbox-group compact">
          ${this.renderCheckbox('desktop_use_cases', 'text', 'Textgenerierung')}
          ${this.renderCheckbox('desktop_use_cases', 'research', 'Recherche')}
          ${this.renderCheckbox('desktop_use_cases', 'translation', 'Übersetzung')}
          ${this.renderCheckbox('desktop_use_cases', 'code', 'Code-Assistenz')}
          ${this.renderCheckbox('desktop_use_cases', 'analysis', 'Datenanalyse')}
          ${this.renderCheckbox('desktop_use_cases', 'other', 'Anderes')}
        </div>
      </div>

      <div class="form-group">
        <label class="required">Hat sich die Qualität eurer Arbeit durch LLMs verbessert?</label>
        <div class="radio-group inline">
          ${this.renderRadio('desktop_quality_improved', 'yes', 'Ja')}
          ${this.renderRadio('desktop_quality_improved', 'no', 'Nein')}
          ${this.renderRadio('desktop_quality_improved', 'unknown', 'Weiß nicht')}
        </div>
      </div>

      <div class="form-group">
        <label class="required">Seid ihr schneller geworden, seit ihr LLMs nutzt?</label>
        <div class="radio-group inline">
          ${this.renderRadio('desktop_faster', 'yes', 'Ja')}
          ${this.renderRadio('desktop_faster', 'no', 'Nein')}
          ${this.renderRadio('desktop_faster', 'unknown', 'Weiß nicht')}
        </div>
      </div>

      ${onlyDesktop ? `
      <div class="form-group">
        <label for="desktop_barrier">Was hält euch aktuell am meisten davon ab, Gen-AI tiefer im Unternehmen einzusetzen?</label>
        <textarea id="desktop_barrier" name="desktop_barrier" rows="4">${this.answers.desktop_barrier || ''}</textarea>
      </div>
      ` : ''}

      <div class="button-group">
        <button type="button" class="btn-primary" id="next-btn">Weiter</button>
      </div>
    `;
  }

  renderSaas() {
    return `
      <h2>SaaS-Tools</h2>

      <div class="form-group">
        <label for="saas_tools" class="required">Welche Gen-AI SaaS-Tools nutzt ihr regelmäßig?</label>
        <textarea id="saas_tools" name="saas_tools" rows="3" placeholder="z.B. Jasper, Notion AI, GitHub Copilot, Midjourney...">${this.answers.saas_tools || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="required">Für welche Anwendungsfälle setzt ihr diese Tools ein?</label>
        <div class="checkbox-group compact">
          ${this.renderCheckbox('saas_use_cases', 'text', 'Textgenerierung')}
          ${this.renderCheckbox('saas_use_cases', 'research', 'Recherche/Analysen')}
          ${this.renderCheckbox('saas_use_cases', 'media', 'Bilder/Video/Audio')}
          ${this.renderCheckbox('saas_use_cases', 'code', 'Code-Assistenz')}
          ${this.renderCheckbox('saas_use_cases', 'analysis', 'Datenanalyse')}
          ${this.renderCheckbox('saas_use_cases', 'other', 'Anderes')}
        </div>
      </div>

      <div class="form-group">
        <label class="required">Wie oft nutzt ihr diese Tools?</label>
        <div class="radio-group inline">
          ${this.renderRadio('saas_usage_frequency', 'monthly', 'Monatlich')}
          ${this.renderRadio('saas_usage_frequency', 'weekly', 'Wöchentlich')}
          ${this.renderRadio('saas_usage_frequency', 'daily', 'Täglich')}
          ${this.renderRadio('saas_usage_frequency', 'multiple_daily', 'Mehrmals täglich')}
        </div>
      </div>

      <div class="form-group">
        <label class="required">Gibt es ein Tool, mit dem ihr sehr zufrieden seid?</label>
        <div class="radio-group inline">
          ${this.renderRadio('saas_has_satisfied', 'yes', 'Ja')}
          ${this.renderRadio('saas_has_satisfied', 'no', 'Nein')}
        </div>
      </div>

      <div class="form-group ${this.answers.saas_has_satisfied !== 'yes' ? 'hidden' : ''}" id="saas_satisfied_group">
        <label for="saas_satisfied_tool">Welches Tool und warum?</label>
        <textarea id="saas_satisfied_tool" name="saas_satisfied_tool" rows="3">${this.answers.saas_satisfied_tool || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="required">Gibt es ein Tool, mit dem ihr sehr unzufrieden seid?</label>
        <div class="radio-group inline">
          ${this.renderRadio('saas_has_unsatisfied', 'yes', 'Ja')}
          ${this.renderRadio('saas_has_unsatisfied', 'no', 'Nein')}
        </div>
      </div>

      <div class="form-group ${this.answers.saas_has_unsatisfied !== 'yes' ? 'hidden' : ''}" id="saas_unsatisfied_group">
        <label for="saas_unsatisfied_tool">Welches Tool und warum?</label>
        <textarea id="saas_unsatisfied_tool" name="saas_unsatisfied_tool" rows="3">${this.answers.saas_unsatisfied_tool || ''}</textarea>
      </div>

      <div class="button-group">
        <button type="button" class="btn-primary" id="next-btn">Weiter</button>
      </div>
    `;
  }

  renderAutomationen() {
    const automationValue = this.answers.automation_value || [];
    const showOtherField = automationValue.includes('other');

    return `
      <h2>Automationen</h2>

      <div class="form-group">
        <label class="required">Welche Software nutzt ihr für Automationen?</label>
        <div class="checkbox-group compact">
          ${this.renderCheckbox('automation_software', 'make', 'Make.com')}
          ${this.renderCheckbox('automation_software', 'n8n', 'n8n')}
          ${this.renderCheckbox('automation_software', 'zapier', 'Zapier')}
          ${this.renderCheckbox('automation_software', 'workato', 'Workato')}
          ${this.renderCheckbox('automation_software', 'power_automate', 'Power Automate')}
          ${this.renderCheckbox('automation_software', 'custom', 'Eigenentwicklung')}
          ${this.renderCheckbox('automation_software', 'other', 'Andere')}
        </div>
      </div>

      <div class="form-group">
        <label class="required">Sind bei euch KI-Agenten im Einsatz?</label>
        <div class="radio-group inline">
          ${this.renderRadio('automation_agents_deployed', 'yes', 'Ja')}
          ${this.renderRadio('automation_agents_deployed', 'no', 'Nein')}
        </div>
      </div>

      <div class="form-group ${this.answers.automation_agents_deployed !== 'yes' ? 'hidden' : ''}" id="automation_agents_use_group">
        <label for="automation_agents_use">Wofür?</label>
        <textarea id="automation_agents_use" name="automation_agents_use" rows="3">${this.answers.automation_agents_use || ''}</textarea>
      </div>

      <div class="form-group">
        <label for="automation_best_results">Welche Automationen liefern die besten messbaren Ergebnisse?</label>
        <textarea id="automation_best_results" name="automation_best_results" rows="3" placeholder="Beispiele/Use-Cases">${this.answers.automation_best_results || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="required">Wie zeigt sich der Mehrwert der Automatisierungen?</label>
        <div class="checkbox-group compact">
          ${this.renderCheckbox('automation_value', 'revenue', 'Mehr Umsatz')}
          ${this.renderCheckbox('automation_value', 'error_rate', 'Geringere Fehlerquote')}
          ${this.renderCheckbox('automation_value', 'satisfaction', 'Kundenzufriedenheit')}
          ${this.renderCheckbox('automation_value', 'cost_savings', 'Kostenersparnis')}
          ${this.renderCheckbox('automation_value', 'less_chaos', 'Weniger Chaos')}
          ${this.renderCheckbox('automation_value', 'other', 'Andere')}
        </div>
      </div>

      <div class="form-group ${!showOtherField ? 'hidden' : ''}" id="automation_value_other_group">
        <label for="automation_value_other">Bitte kurz beschreiben</label>
        <textarea id="automation_value_other" name="automation_value_other" rows="2">${this.answers.automation_value_other || ''}</textarea>
      </div>

      <div class="form-group">
        <label for="automation_count" class="required">Wie viele Automationen sind aktiv?</label>
        <input type="number" id="automation_count" name="automation_count" min="0" value="${this.answers.automation_count || ''}" placeholder="0">
      </div>

      <div class="button-group">
        <button type="button" class="btn-primary" id="next-btn">Weiter</button>
      </div>
    `;
  }

  renderNonusers() {
    return `
      <h2>Nicht-Nutzung</h2>

      <div class="form-group">
        <label class="required">Warum nutzt ihr noch keine Gen-AI?</label>
        <div class="checkbox-group compact">
          ${this.renderCheckbox('nonusers_reasons', 'no_use_case', 'Kein klarer Use-Case')}
          ${this.renderCheckbox('nonusers_reasons', 'privacy', 'Datenschutz/Sicherheit')}
          ${this.renderCheckbox('nonusers_reasons', 'budget', 'Budget')}
          ${this.renderCheckbox('nonusers_reasons', 'time', 'Zeitmangel')}
          ${this.renderCheckbox('nonusers_reasons', 'knowledge', 'Fehlendes Know-how')}
          ${this.renderCheckbox('nonusers_reasons', 'bad_experience', 'Schlechte Erfahrungen')}
          ${this.renderCheckbox('nonusers_reasons', 'regulation', 'Regulatorik')}
          ${this.renderCheckbox('nonusers_reasons', 'other', 'Anderes')}
        </div>
      </div>

      <div class="form-group">
        <label for="nonusers_what_needed">Was müsste passieren, damit ihr startet?</label>
        <textarea id="nonusers_what_needed" name="nonusers_what_needed" rows="3">${this.answers.nonusers_what_needed || ''}</textarea>
      </div>

      <div class="form-group">
        <label class="required">Plant ihr bis 2026 den Einsatz von Gen-AI?</label>
        <div class="radio-group inline">
          ${this.renderRadio('nonusers_plan_2026', 'yes', 'Ja')}
          ${this.renderRadio('nonusers_plan_2026', 'no', 'Nein')}
          ${this.renderRadio('nonusers_plan_2026', 'unsure', 'Unsicher')}
        </div>
      </div>

      <div class="button-group">
        <button type="button" class="btn-primary" id="next-btn">Weiter</button>
      </div>
    `;
  }

  renderDienstleister() {
    return `
      <h2>Dienstleister</h2>

      <div class="form-group">
        <label class="required">Wurde für Gen-AI/Automatisierung bereits ein externer Dienstleister beauftragt?</label>
        <div class="radio-group inline">
          ${this.renderRadio('provider_hired', 'yes', 'Ja')}
          ${this.renderRadio('provider_hired', 'no', 'Nein')}
        </div>
      </div>

      <div id="provider_details" class="${this.answers.provider_hired !== 'yes' ? 'hidden' : ''}">
        <div class="form-group">
          <label for="provider_duration" class="required">Dauer der Zusammenarbeit (Wochen)</label>
          <input type="number" id="provider_duration" name="provider_duration" min="0" value="${this.answers.provider_duration || '1'}" placeholder="1">
        </div>

        <div class="form-group">
          <label for="provider_good">Was hat der Dienstleister besonders gut gemacht?</label>
          <textarea id="provider_good" name="provider_good" rows="3">${this.answers.provider_good || ''}</textarea>
        </div>

        <div class="form-group">
          <label for="provider_better">Was hätte der Dienstleister besser machen können?</label>
          <textarea id="provider_better" name="provider_better" rows="3">${this.answers.provider_better || ''}</textarea>
        </div>

        <div class="form-group">
          <label for="provider_budget">Budgetrahmen (optional)</label>
          <select id="provider_budget" name="provider_budget">
            <option value="">Bitte wählen...</option>
            ${this.renderOption('provider_budget', '<10k', '< 10k')}
            ${this.renderOption('provider_budget', '10-25k', '10–25k')}
            ${this.renderOption('provider_budget', '25-50k', '25–50k')}
            ${this.renderOption('provider_budget', '50-100k', '50–100k')}
            ${this.renderOption('provider_budget', '>100k', '> 100k')}
          </select>
        </div>

        <div class="form-group">
          <label class="required">Gesamtzufriedenheit</label>
          <div class="star-rating" id="provider_satisfaction_stars">
            ${[1, 2, 3, 4, 5].map(i => `<span class="star ${(this.answers.provider_satisfaction || 0) >= i ? 'active' : ''}" data-value="${i}"></span>`).join('')}
          </div>
        </div>
      </div>

      <div class="button-group">
        <button type="button" class="btn-primary" id="next-btn">Weiter</button>
      </div>
    `;
  }

  renderAbschluss() {
    return `
      <h2>Abschluss</h2>

      <div class="form-group">
        <label class="required">Gibt es bei euch eine IT-Abteilung?</label>
        <div class="radio-group inline">
          ${this.renderRadio('has_it_department', 'yes', 'Ja')}
          ${this.renderRadio('has_it_department', 'no', 'Nein')}
        </div>
      </div>

      <div class="form-group">
        <label class="required">Plant ihr 2026 Investitionen in Automatisierung/Gen-AI?</label>
        <div class="radio-group inline">
          ${this.renderRadio('plan_2026_investment', 'yes', 'Ja')}
          ${this.renderRadio('plan_2026_investment', 'no', 'Nein')}
          ${this.renderRadio('plan_2026_investment', 'unsure', 'Unsicher')}
        </div>
      </div>

      <div class="form-group">
        <label for="report_email" class="required">E-Mail für den Report</label>
        <input type="email" id="report_email" name="report_email" value="${this.answers.report_email || ''}" placeholder="ihre.email@beispiel.de">
      </div>

      <div class="form-group">
        <label>Nächste Schritte</label>
        <div class="checkbox-group">
          ${this.renderCheckbox('next_steps', 'contact', 'Ich erlaube, mich bei Rückfragen zur Umfrage zu kontaktieren.')}
          ${this.renderCheckbox('next_steps', 'report', 'Ich möchte die Ergebnisse/den Report per E-Mail erhalten.')}
          ${this.renderCheckbox('next_steps', 'strategy', 'Ich erlaube Carlo, mich auf Basis meiner Antworten eventuell zu einem Strategie Gespräch einzuladen.')}
        </div>
      </div>

      <div class="button-group">
        <button type="button" class="btn-primary" id="next-btn">Absenden</button>
      </div>
    `;
  }

  renderSuccess() {
    return `
      <div class="survey-container">
        <div class="success-message">
          <div class="success-icon">✓</div>
          <h2>Vielen Dank!</h2>
          <p>Deine Antworten wurden erfolgreich übermittelt.</p>
          <p>Der Report wird dir zugeschickt, sobald wir 100 Antworten erhalten haben.</p>
          <div class="contact-info">
            <p>Bei Fragen erreichst du mich auf <a href="${CONFIG.LINKEDIN_URL}" target="_blank" rel="noopener noreferrer">LinkedIn</a> oder telefonisch unter <a href="tel:${CONFIG.PHONE}">${CONFIG.PHONE}</a>.</p>
          </div>
        </div>
      </div>
      <footer class="footer">
        <p>Daten nur zur Auswertung dieser Umfrage. Kein Verkauf. Report per E-Mail.</p>
      </footer>
    `;
  }

  renderRadio(name, value, label) {
    const checked = this.answers[name] === value ? 'checked' : '';
    const id = `${name}_${value}`;
    return `
      <div class="radio-option">
        <input type="radio" id="${id}" name="${name}" value="${value}" ${checked}>
        <label for="${id}">${label}</label>
      </div>
    `;
  }

  renderCheckbox(name, value, label, disabled = false) {
    const values = this.answers[name] || [];
    const checked = values.includes(value) ? 'checked' : '';
    const disabledAttr = disabled ? 'disabled' : '';
    const id = `${name}_${value}`;
    return `
      <div class="checkbox-option">
        <input type="checkbox" id="${id}" name="${name}" value="${value}" ${checked} ${disabledAttr}>
        <label for="${id}">${label}</label>
      </div>
    `;
  }

  renderOption(name, value, label) {
    const selected = this.answers[name] === value ? 'selected' : '';
    return `<option value="${value}" ${selected}>${label}</option>`;
  }

  renderMultiOption(name, value, label) {
    const values = this.answers[name] || [];
    const selected = values.includes(value) ? 'selected' : '';
    return `<option value="${value}" ${selected}>${label}</option>`;
  }

  attachEventListeners() {
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.handleStart());
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.handleNext());
    }

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.handleBack());
    }

    document.querySelectorAll('input[type="text"], input[type="email"], input[type="number"], textarea, select').forEach(input => {
      input.addEventListener('input', (e) => {
        this.handleAnswerChange(e.target.name, e.target.value);
      });
    });

    document.querySelectorAll('input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.handleAnswerChange(e.target.name, e.target.value);
        
        if (e.target.name === 'uses_erp') {
          const erpNameGroup = document.getElementById('erp_name_group');
          if (erpNameGroup) {
            erpNameGroup.classList.toggle('hidden', e.target.value !== 'yes');
          }
        }

        if (e.target.name === 'genai_measurable') {
          const blockerGroup = document.getElementById('measurable_blocker_group');
          if (blockerGroup) {
            blockerGroup.classList.toggle('hidden', e.target.value !== 'no');
          }
        }

        if (e.target.name === 'saas_has_satisfied') {
          const group = document.getElementById('saas_satisfied_group');
          if (group) {
            group.classList.toggle('hidden', e.target.value !== 'yes');
          }
        }

        if (e.target.name === 'saas_has_unsatisfied') {
          const group = document.getElementById('saas_unsatisfied_group');
          if (group) {
            group.classList.toggle('hidden', e.target.value !== 'yes');
          }
        }

        if (e.target.name === 'automation_agents_deployed') {
          const group = document.getElementById('automation_agents_use_group');
          if (group) {
            group.classList.toggle('hidden', e.target.value !== 'yes');
          }
        }

        if (e.target.name === 'provider_hired') {
          const details = document.getElementById('provider_details');
          if (details) {
            details.classList.toggle('hidden', e.target.value !== 'yes');
          }
        }
      });
    });

    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        let values = this.answers[e.target.name] || [];
        
        if (e.target.name === 'genai_use') {
          if (e.target.value === 'none' && e.target.checked) {
            values = ['none'];
            document.querySelectorAll(`input[name="genai_use"]`).forEach(cb => {
              if (cb.value !== 'none') {
                cb.checked = false;
                cb.disabled = true;
              }
            });
          } else if (e.target.value === 'none' && !e.target.checked) {
            values = [];
            document.querySelectorAll(`input[name="genai_use"]`).forEach(cb => {
              cb.disabled = false;
            });
          } else {
            document.querySelectorAll(`input[name="genai_use"]`).forEach(cb => {
              if (cb.value === 'none') {
                cb.checked = false;
              }
            });
            
            if (e.target.checked) {
              if (!values.includes(e.target.value)) {
                values.push(e.target.value);
              }
            } else {
              values = values.filter(v => v !== e.target.value);
            }
            values = values.filter(v => v !== 'none');
          }
        } else {
          if (e.target.checked) {
            if (!values.includes(e.target.value)) {
              values.push(e.target.value);
            }
          } else {
            values = values.filter(v => v !== e.target.value);
          }
        }
        
        if (e.target.name === 'automation_value') {
          const otherGroup = document.getElementById('automation_value_other_group');
          if (otherGroup) {
            otherGroup.classList.toggle('hidden', !values.includes('other'));
          }
        }
        
        this.handleAnswerChange(e.target.name, values);
      });
    });

    document.querySelectorAll('select[multiple]').forEach(select => {
      select.addEventListener('change', (e) => {
        const values = Array.from(e.target.selectedOptions).map(opt => opt.value);
        this.handleAnswerChange(e.target.name, values);
      });
    });

    const stars = document.querySelectorAll('.star');
    stars.forEach(star => {
      star.addEventListener('click', (e) => {
        const value = parseInt(e.target.dataset.value);
        this.handleAnswerChange('provider_satisfaction', value);
        
        stars.forEach(s => {
          const starValue = parseInt(s.dataset.value);
          s.classList.toggle('active', starValue <= value);
        });
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new SurveyApp();
});
