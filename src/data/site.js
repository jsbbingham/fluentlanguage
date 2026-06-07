// FluentLanguage.net — central content source.
// Editing copy here keeps it out of the component markup.

import {
  FileText,
  Mic,
  Scale,
  Stethoscope,
  Languages,
  GraduationCap,
  Globe2,
  ShieldCheck,
  Clock,
  MapPin,
} from 'lucide-react'

export const BRAND = {
  name: 'FluentLanguage',
  person: 'Isela Bingham',
  tagline: 'Spanish ↔ English Interpreter & Translator',
  email: 'ibingham@compuprotech.com',
  location: 'Stockton, California',
  yearsExperience: '20+',
  clients: '500+',
}

export const NAV = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Reviews', to: '/reviews' },
  { label: 'Contact', to: '/contact' },
]

export const TRUST = [
  { icon: ShieldCheck, label: '20+ Years Experience' },
  { icon: Scale, label: 'Court & Medical Certified' },
  { icon: MapPin, label: 'Serving California' },
  { icon: Clock, label: 'Fast Turnaround' },
]

export const SERVICES = [
  {
    icon: FileText,
    title: 'Document Translation',
    body: 'Medical reports, psychological evaluations, IFSPs, IPPs, IEPs, and legal documents — translated with certified accuracy and the right terminology in both languages.',
    feature: true,
  },
  {
    icon: Mic,
    title: 'Interpretation',
    body: 'Simultaneous interpretation for conferences of 100+ attendees, plus consecutive and sight interpretation — in person or virtual.',
  },
  {
    icon: Scale,
    title: 'Legal Support',
    body: "Workers' compensation law, attorney support, and court proceedings handled with precise legal terminology.",
  },
  {
    icon: Stethoscope,
    title: 'Medical Interpretation',
    body: 'Healthcare settings, patient communication, and medical documentation — HIPAA-aware and culturally fluent.',
  },
]

export const STATS = [
  { icon: Globe2, value: '20+', label: 'Years of professional experience' },
  { icon: Languages, value: '500+', label: 'Clients trusted across California' },
]

export const CREDENTIALS = [
  'Certified Court Interpreter (Spanish ↔ English)',
  'Medical & Healthcare Interpretation',
  "Workers' Compensation specialization",
  'Simultaneous interpretation (100+ attendees)',
  'IEP / IFSP / IPP document translation',
  '20+ years professional practice',
]

export const FOCUS_AREAS = [
  { icon: Scale, label: 'Legal & Courts' },
  { icon: Stethoscope, label: 'Medical & Healthcare' },
  { icon: GraduationCap, label: 'Education & Schools' },
]

export const PORTRAIT = '/images/isela-bingham.jpg'

export const AFFILIATIONS = [
  'Valley Mountain Regional Center — contractor since 2006',
  'Reliable Translations, Inc.',
  'Now Interpreters',
]

export const CONTACT_SUBJECTS = [
  { value: 'translation', label: 'Document Translation' },
  { value: 'interpretation', label: 'Interpretation Services' },
  { value: 'legal', label: "Legal / Workers' Compensation" },
  { value: 'medical', label: 'Medical / Healthcare' },
  { value: 'other', label: 'Other' },
]
