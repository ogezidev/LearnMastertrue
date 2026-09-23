// Mesmas regras que o backend valida (SenhaPolicy)
export const SENHA_REGRAS = [
  { id: 'min',     label: 'Mínimo 8 caracteres',           test: (s) => s.length >= 8 },
  { id: 'upper',   label: 'Uma letra maiúscula',            test: (s) => /[A-Z]/.test(s) },
  { id: 'lower',   label: 'Uma letra minúscula',            test: (s) => /[a-z]/.test(s) },
  { id: 'number',  label: 'Um número',                      test: (s) => /[0-9]/.test(s) },
  { id: 'special', label: 'Um caractere especial (!@#...)', test: (s) => /[^A-Za-z0-9]/.test(s) },
];

export const senhaValida = (senha) => SENHA_REGRAS.every((r) => r.test(senha));
