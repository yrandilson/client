import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("");
  const [ncm, setNcm] = useState<string>("");

  const { data: reimbursements, isLoading: loadingReimbursements } = trpc.reimbursements.list.useQuery({
    status: status || undefined,
    limit: 50,
  });

  const { data: stats } = trpc.reimbursements.getStats.useQuery();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Apta para Reembolso":
        return <Badge className="bg-green-100 text-green-800">Apta para Reembolso</Badge>;
      case "Pendente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "Divergente":
        return <Badge className="bg-red-100 text-red-800">Divergente</Badge>;
      case "Aprovado":
        return <Badge className="bg-blue-100 text-blue-800">Aprovado</Badge>;
      case "Rejeitado":
        return <Badge className="bg-gray-100 text-gray-800">Rejeitado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Apta para Reembolso":
      case "Aprovado":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Divergente":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "Pendente":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Listagem de reembolsos tributários</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Indicadores */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aprovados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.approved || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Divergentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.divergent || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rejeitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{(stats as any)?.rejected || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="Apta para Reembolso">Apta para Reembolso</SelectItem>
                    <SelectItem value="Pendente">Pendente</SelectItem>
                    <SelectItem value="Divergente">Divergente</SelectItem>
                    <SelectItem value="Aprovado">Aprovado</SelectItem>
                    <SelectItem value="Rejeitado">Rejeitado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">NCM</label>
                <Input 
                  placeholder="Filtrar por NCM" 
                  value={ncm}
                  onChange={(e) => setNcm(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setStatus("");
                    setNcm("");
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Reembolsos</CardTitle>
            <CardDescription>
              {loadingReimbursements ? "Carregando..." : `Total: ${reimbursements?.length || 0}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingReimbursements ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="animate-spin w-6 h-6" />
              </div>
            ) : reimbursements && reimbursements.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Declaração</TableHead>
                      <TableHead>Valor Reembolso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data Criação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reimbursements.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">#{r.id}</TableCell>
                        <TableCell>#{r.declarationId}</TableCell>
                        <TableCell>R$ {parseFloat(r.reimbursementValue).toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(r.status)}
                            {getStatusBadge(r.status)}
                          </div>
                        </TableCell>
                        <TableCell>{new Date(r.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Nenhum reembolso encontrado
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
