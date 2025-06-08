
# StyleMatch

A fashion-forward commerce platform built to empower vendors in Nigeria and beyond.

StyleMatch helps social vendors showcase their inventory, streamline orders, and get paid — without hassles. Whether you're selling on Instagram, WhatsApp, or in-store, StyleMatch connects your business to the tools you need to grow.

---

## ✨ Features

- Personalized online storefront for each vendor  
- Mobile-first customer shopping experience  
- Real-time inventory and sales tracking  
- Seamless product uploads from WhatsApp, Instagram, and file imports  
- Paystack-powered payment and payout system  
- Chat-enabled customer support  
- Social media integration  
- Responsive dashboard with actionable insights  

---

## 🧠 Tech Stack

- **Frontend**: React (Vite) + Radix UI  
- **Backend**: Supabase (PostgreSQL + Auth)  
- **Payments**: Paystack  
- **Deployment**: Vercel (Frontend)  

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/freedompraise/stylematch.fashion..git
cd stylematch
````

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Make sure to configure the following environment variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PAYSTACK_PUBLIC_KEY=
VITE_STYLEMATCH_SUPPORT_PHONE=234XXXXXXXXXX
```

---

## 🛠 Folder Structure

```bash
├── frontend/              # Vite + React app
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route-based components
│   ├── lib/               # Helpers and API utils
│   ├── hooks/             # Custom React hooks
│   └── styles/            # Global and module CSS
└── supabase/              # Database schema and seed data
```

---

## 🧩 Supabase Setup

Use the `supabase` folder to:

* Initialize your schema
* Define triggers and policies
* Manage row-level security

Create tables:

```bash
supabase db push
```

---

## 🏦 Paystack Integration

Ensure each vendor has:

* A valid bank name and account number
* Payout preference: manual or automatic
* A configured `payout_info` field in the database

Subaccounts are automatically created using vendor data on onboarding.

---

## 🤝 Contributing

We welcome contributions that align with the mission of empowering social vendors.

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Open a PR

Please keep PRs focused and documented.

---

## 📫 Support

For questions, feedback or feature requests:

**📧** [marketmatchofficial@gmail.com](mailto:marketmatchofficial@gmail.com)
**📞** +234 907 457 7147

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

```

