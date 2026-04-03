export type RequestStatus = "en_attente" | "approuve" | "refuse";
export type RequestType = "conge" | "remboursement" | "heures_sup";
export type CongeType = "annuel" | "maladie" | "sans_solde" | "exceptionnel" | "maternite";

export const congeTypeLabels: Record<CongeType, string> = {
  annuel: "Congé annuel",
  maladie: "Congé maladie",
  sans_solde: "Sans solde",
  exceptionnel: "Congé exceptionnel",
  maternite: "Congé maternité",
};

export const statusLabels: Record<RequestStatus, string> = {
  en_attente: "En attente",
  approuve: "Approuvé",
  refuse: "Refusé",
};

export const statusColors: Record<RequestStatus, string> = {
  en_attente: "bg-warning/10 text-warning",
  approuve: "bg-success/10 text-success",
  refuse: "bg-destructive/10 text-destructive",
};
