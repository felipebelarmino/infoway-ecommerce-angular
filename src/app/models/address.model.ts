export class Address {
  id: number;
  logradouro: string;
  numero: number;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string; //virtual
  user_id: number;
}
