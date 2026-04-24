import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function AnomalyReview() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [selectedAnomaly, setSelectedAnomaly] = useState<any>(null);
  const [reviewReason, setReviewReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const { data: anomalies, isLoading: loadingAnomalies, refetch } = trpc.anomalies.list.useQuery({
    status: "Bloqueado",
    limit: 50,
  });

  const approveMutation = trpc.anomalies.approve.useMutation({
    onSuccess: () => {
      toast.success("Anomalia aprovada com sucesso!");
      setSelectedAnomaly(null);
      setReviewReason("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const rejectMutation = trpc.anomalies.reject.useMutation({
    onSuccess: () => {
      toast.success("Anomalia rejeitada com sucesso!");
      setSelectedAnomaly(null);
      setReviewReason("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleApprove = async () => {
    if (!selectedAnomaly) return;
    
    setApproving(true);
    try {
      await approveMutation.mutateAsync({
        id: selectedAnomaly.id,
        reason: reviewReason || undefined,
      });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedAnomaly) return;
    
    setRejecting(true);
    try {
      await rejectMutation.mutateAsync({
        id: selectedAnomaly.id,
        reason: reviewReason || undefined,
      });
    } finally {
      setRejecting(false);
    }
  };

  // Apenas admins podem acessar esta página
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Apenas administradores podem acessar esta página.
            </p>
            <Button onClick={() => setLocation("/")} className="w-full">
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Revisão de Anomalias</h1>
              <p className="text-sm text-gray-600">Revise pedidos bloqueados por anomalias</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Anomalias */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Anomalias Bloqueadas</CardTitle>
                <CardDescription>
                  {loadingAnomalies ? "Carregando..." : `Total: ${anomalies?.length || 0}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAnomalies ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="animate-spin w-6 h-6" />
                  </div>
                ) : anomalies && anomalies.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {anomalies.map((anomaly: any) => (
                      <button
                        key={anomaly.id}
                        onClick={() => {
                          setSelectedAnomaly(anomaly);
                          setReviewReason("");
                        }}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedAnomaly?.id === anomaly.id
                            ? "bg-blue-50 border-blue-300"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              #{anomaly.id}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              Reembolso #{anomaly.reimbursementId}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Score: {parseFloat(anomaly.anomalyScore).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Nenhuma anomalia bloqueada
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalhes da Anomalia */}
          <div className="lg:col-span-2">
            {selectedAnomaly ? (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      Detalhes da Anomalia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">ID Anomalia</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          #{selectedAnomaly.id}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">ID Reembolso</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          #{selectedAnomaly.reimbursementId}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tipo de Anomalia</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {selectedAnomaly.anomalyType}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Score</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {parseFloat(selectedAnomaly.anomalyScore).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Média Histórica</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          R$ {parseFloat(selectedAnomaly.historicalAverage || 0).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Desvio %</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {parseFloat(selectedAnomaly.deviationPercentage || 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Descrição</p>
                      <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded">
                        {selectedAnomaly.description || "Sem descrição"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Data Criação</p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {new Date(selectedAnomaly.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Decisão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Motivo da Revisão (Opcional)
                      </label>
                      <Textarea
                        placeholder="Digite o motivo da sua decisão..."
                        value={reviewReason}
                        onChange={(e) => setReviewReason(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleApprove}
                        disabled={approving || approveMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {approving || approveMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Aprovando...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleReject}
                        disabled={rejecting || rejectMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        {rejecting || rejectMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Rejeitando...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeitar
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <p className="text-gray-500">Selecione uma anomalia para revisar</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
