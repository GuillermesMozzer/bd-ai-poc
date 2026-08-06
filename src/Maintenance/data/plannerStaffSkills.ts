export type PlannerStaffSkillLevel = 3 | 4;

export type PlannerStaffSkillCategory = {
  category: string;
  skills: Array<{
    skill: string;
    level: PlannerStaffSkillLevel;
  }>;
};

export const plannerStaffSkillMatrix = {
  'Priya Patel': [
    {
      category: 'Mechanical',
      skills: [
        { skill: 'Bearings & Mechanical Interfaces', level: 4 },
        { skill: 'Lubrication', level: 4 },
        { skill: 'Power Transmission', level: 3 },
      ],
    },
    {
      category: 'Reliability & Maintenance',
      skills: [
        { skill: 'Basic Maintenance Concepts', level: 4 },
        { skill: 'Condition Monitoring & Reliability', level: 3 },
      ],
    },
    {
      category: 'Safety',
      skills: [{ skill: 'Lockout/Tagout (LOTO) / Energy Isolation', level: 3 }],
    },
  ],
  'Emily Watson': [
    {
      category: 'Electrical & Automation',
      skills: [
        { skill: 'Electrical Fundamentals', level: 4 },
        { skill: 'Motors & Drives', level: 4 },
        { skill: 'Automation & Control Systems', level: 3 },
      ],
    },
    {
      category: 'Safety',
      skills: [
        { skill: 'Lockout/Tagout (LOTO) / Energy Isolation', level: 4 },
        { skill: 'Risk Assessment & Hazard Analysis', level: 3 },
      ],
    },
  ],
  'David Kim': [
    {
      category: 'Reliability & Maintenance',
      skills: [
        { skill: 'Maintenance Planning Fundamentals', level: 4 },
        { skill: 'Condition Monitoring & Reliability', level: 4 },
        { skill: 'Basic Maintenance Concepts', level: 3 },
      ],
    },
    {
      category: 'Mechanical',
      skills: [{ skill: 'Mechanical Tools & Metrology', level: 3 }],
    },
  ],
  'Mike Johnson': [
    {
      category: 'Mechanical',
      skills: [
        { skill: 'Power Transmission', level: 4 },
        { skill: 'Mechanical Tools & Metrology', level: 4 },
        { skill: 'Bearings & Mechanical Interfaces', level: 3 },
      ],
    },
    {
      category: 'Safety',
      skills: [
        { skill: 'Personal Protective Equipment (PPE)', level: 4 },
        { skill: 'Risk Assessment & Hazard Analysis', level: 3 },
      ],
    },
  ],
  'Carlos Rodriguez': [
    {
      category: 'Mechanical',
      skills: [
        { skill: 'Lubrication', level: 4 },
        { skill: 'Bearings & Mechanical Interfaces', level: 3 },
        { skill: 'Mechanical Tools & Metrology', level: 3 },
      ],
    },
    {
      category: 'Reliability & Maintenance',
      skills: [
        { skill: 'Basic Maintenance Concepts', level: 4 },
        { skill: 'Maintenance Planning Fundamentals', level: 3 },
      ],
    },
  ],
  'Ana Martins': [
    {
      category: 'Electrical & Automation',
      skills: [
        { skill: 'Automation & Control Systems', level: 4 },
        { skill: 'Motors & Drives', level: 3 },
        { skill: 'Electrical Fundamentals', level: 3 },
      ],
    },
    {
      category: 'Safety',
      skills: [{ skill: 'Lockout/Tagout (LOTO) / Energy Isolation', level: 4 }],
    },
  ],
  'Bruno Arruda': [
    {
      category: 'Mechanical',
      skills: [
        { skill: 'Bearings & Mechanical Interfaces', level: 4 },
        { skill: 'Lubrication', level: 4 },
        { skill: 'Power Transmission', level: 3 },
      ],
    },
    {
      category: 'Safety',
      skills: [
        { skill: 'Personal Protective Equipment (PPE)', level: 4 },
        { skill: 'Lockout/Tagout (LOTO) / Energy Isolation', level: 3 },
      ],
    },
  ],
  'Daniel Ortega': [
    {
      category: 'Electrical & Automation',
      skills: [
        { skill: 'Electrical Fundamentals', level: 4 },
        { skill: 'Motors & Drives', level: 4 },
        { skill: 'Automation & Control Systems', level: 3 },
      ],
    },
    {
      category: 'Reliability & Maintenance',
      skills: [{ skill: 'Condition Monitoring & Reliability', level: 3 }],
    },
  ],
  'Emerson Stanton': [
    {
      category: 'Safety',
      skills: [
        { skill: 'Personal Protective Equipment (PPE)', level: 4 },
        { skill: 'Risk Assessment & Hazard Analysis', level: 3 },
      ],
    },
    {
      category: 'Reliability & Maintenance',
      skills: [{ skill: 'Basic Maintenance Concepts', level: 3 }],
    },
  ],
} satisfies Record<string, PlannerStaffSkillCategory[]>;

export const plannerFallbackSkillMatrix = [
  {
    category: 'Reliability & Maintenance',
    skills: [
      { skill: 'Basic Maintenance Concepts', level: 3 },
      { skill: 'Maintenance Planning Fundamentals', level: 3 },
    ],
  },
] satisfies PlannerStaffSkillCategory[];

export function getPlannerStaffSkillMatrix(name: string) {
  return plannerStaffSkillMatrix[name] ?? plannerFallbackSkillMatrix;
}
