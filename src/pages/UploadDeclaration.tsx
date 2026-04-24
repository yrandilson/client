import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function UploadDeclaration() {
  const [location, setLocation] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);

  const uploadMutation = trpc.declarations.upload.useMutation({
    onSuccess: (data) => {
      setUploadResult(data);
      setSelectedFile(null);
      toast.success("Declaração processada com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Por favor, selecione um arquivo PDF");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande (máximo 10MB)");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Por favor, selecione um arquivo");
      return;
    }

    setUploading(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      
      await uploadMutation.mutateAsync({
        documentBuffer: base64,
        fileName: selectedFile.name,
      });
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Apta para Reembolso":
        return <Badge className="bg-green-100 text-green-800">Apta para Reembolso</Badge>;
      case "Pendente":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case "Divergente":
        return <Badge className="bg-red-100 text-red-800">Divergente</Badge>;
      default:
        return <Badge>{status}</Badge>;
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
              <h1 className="text-2xl font-bold text-gray-900">Upload de Declaração</h1>
              <p className="text-sm text-gray-600">Carregue um PDF de declaração de importação</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Arquivo</CardTitle>
            <CardDescription>
              Faça upload de um PDF com a declaração de importação ou nota fiscal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Clique para selecionar um arquivo ou arraste aqui
              </p>
              <p className="text-xs text-gray-500">
                PDF até 10MB
              </p>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4"
              >
                Selecionar PDF
              </Button>
            </div>

            {selectedFile && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900">
                  Arquivo selecionado: {selectedFile.name}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Tamanho: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading || uploadMutation.isPending}
              className="w-full"
              size="lg"
            >
              {uploading || uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Fazer Upload e Processar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {uploadResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {uploadResult.status === "Divergente" ? (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    Processamento Concluído com Anomalia
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Processamento Concluído
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(uploadResult.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Mensagem</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {uploadResult.message}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">ID Declaração</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      #{uploadResult.declarationId}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">ID Reembolso</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      #{uploadResult.reimbursementId}
                    </p>
                  </div>
                </div>
                {uploadResult.anomalyId && (
                  <div>
                    <p className="text-sm text-gray-600">ID Anomalia</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      #{uploadResult.anomalyId}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadResult(null);
                    setSelectedFile(null);
                  }}
                  className="flex-1"
                >
                  Fazer Outro Upload
                </Button>
                <Button
                  onClick={() => setLocation("/dashboard")}
                  className="flex-1"
                >
                  Ir para Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Informações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium text-gray-900">Dados Extraídos Automaticamente:</p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Nº da Declaração</li>
                <li>NCM (Nomenclatura Comum do Mercosul)</li>
                <li>Valor Pago</li>
                <li>Alíquota Paga</li>
                <li>Alíquota Vigente</li>
                <li>Data da Declaração</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-900">Processamento Automático:</p>
              <ul className="list-disc list-inside text-gray-600 mt-2 space-y-1">
                <li>Cálculo automático de reembolso</li>
                <li>Detecção de anomalias</li>
                <li>Atribuição de status</li>
                <li>Bloqueio automático se necessário</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
