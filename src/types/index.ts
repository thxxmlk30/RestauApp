//Type utilisateur

export interface User{
    id: string;
    nom : string;
    email : string;
    role : 'admin' | 'client' | 'chef';
}

//Statut de commandes
export type StatutCommande = 'en_attente' | 'en_traitement' | 'prete' | 'livree' | 'annulee';

//Type de commande
export interface commande{
    id : string;
    numeroTable : number;
    articles : orderItem[];
    statut : statutCom[];
    montant : number;
    Heure : string;
    nomClient? : string;
}

// article dans une commande
export interface orderItem{
    menuItemId : string;
    nom : string;
    quantite : number;
    prix : number;
}

// Type d'un plat du menu
export interface MenuItem {
  id: string;
  nom: string;
  description: string;
  prix: number;
  category: 'entree' | 'plat' | 'dessert' | 'boisson';
  image: string;
  disponible: boolean;
}

// Statistiques dashboard
export interface DashboardStats {
  commandesJour: number;
  revenuejour: number;
  tablesOccupes: number;
  totalTables: number;
  commandesAttente: number;
}