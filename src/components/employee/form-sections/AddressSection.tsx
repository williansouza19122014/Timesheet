
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

interface AddressSectionProps {
  address: Address;
  handleInputChange: (field: string, value: string) => void;
}

export const AddressSection = ({
  address,
  handleInputChange,
}: AddressSectionProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Endereço</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="street">Rua *</Label>
          <Input
            id="street"
            value={address.street}
            onChange={(e) => handleInputChange('address.street', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="number">Número *</Label>
          <Input
            id="number"
            value={address.number}
            onChange={(e) => handleInputChange('address.number', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            value={address.complement}
            onChange={(e) => handleInputChange('address.complement', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood">Bairro *</Label>
          <Input
            id="neighborhood"
            value={address.neighborhood}
            onChange={(e) => handleInputChange('address.neighborhood', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            value={address.city}
            onChange={(e) => handleInputChange('address.city', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">Estado *</Label>
          <Input
            id="state"
            value={address.state}
            onChange={(e) => handleInputChange('address.state', e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip_code">CEP *</Label>
          <Input
            id="zip_code"
            value={address.zip_code}
            onChange={(e) => handleInputChange('address.zip_code', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
};
