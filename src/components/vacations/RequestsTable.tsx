
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { VacationRequest } from "@/types/vacations";

interface RequestsTableProps {
  requests: VacationRequest[];
  isPJ?: boolean;
}

const RequestsTable = ({ requests, isPJ = false }: RequestsTableProps) => {
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Solicitações de {isPJ ? 'Descanso' : 'Férias'}</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Período</TableHead>
            <TableHead>Dias</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Venda</TableHead>
            <TableHead>Pagamento</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>
                {format(new Date(request.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(request.end_date), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>{request.days_taken} dias</TableCell>
              <TableCell>
                <Badge variant={
                  request.status === 'approved' ? 'default' :
                  request.status === 'pending' ? 'secondary' :
                  request.status === 'denied' ? 'destructive' :
                  'outline'
                }>
                  {request.status === 'approved' && 'Aprovado'}
                  {request.status === 'pending' && 'Pendente'}
                  {request.status === 'denied' && 'Negado'}
                  {request.status === 'cancelled' && 'Cancelado'}
                </Badge>
              </TableCell>
              <TableCell>{request.sold_days ? `${request.sold_days} DIAS` : '--'}</TableCell>
              <TableCell>
                {request.payment_date 
                  ? format(new Date(request.payment_date), 'dd/MM/yyyy', { locale: ptBR })
                  : '--'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RequestsTable;
