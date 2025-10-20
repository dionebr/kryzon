import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Upload, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function MachineCreate() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    difficulty: "",
    category: "",
    xp: "",
    vmFile: null as File | null,
    flags: [{ id: 1, value: "", points: "" }],
    attachments: [] as File[],
    hints: "",
  });

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const addFlag = () => {
    setFormData({
      ...formData,
      flags: [...formData.flags, { id: Date.now(), value: "", points: "" }],
    });
  };

  const removeFlag = (id: number) => {
    setFormData({
      ...formData,
      flags: formData.flags.filter((f) => f.id !== id),
    });
  };

  const handleSubmit = () => {
    toast.success("Máquina enviada para revisão!");
    navigate("/machines/my-submissions");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/machines")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Criar Nova Máquina</h1>
          <p className="text-muted-foreground mt-1">
            Passo {step} de {totalSteps}
          </p>
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="gradient-card border-border">
        <CardHeader>
          <CardTitle>
            {step === 1 && "Informações Básicas"}
            {step === 2 && "Upload de Arquivos"}
            {step === 3 && "Configuração de Flags"}
            {step === 4 && "Recursos e Anexos"}
            {step === 5 && "Preview e Submissão"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Informações Básicas */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Máquina</Label>
                <Input
                  id="name"
                  placeholder="Ex: Lab1 - SQL Injection"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o objetivo e contexto da máquina..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="difficulty">Dificuldade</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                  >
                    <SelectTrigger id="difficulty">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fácil">Fácil</SelectItem>
                      <SelectItem value="Médio">Médio</SelectItem>
                      <SelectItem value="Difícil">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web">Web</SelectItem>
                      <SelectItem value="Pwn">Pwn</SelectItem>
                      <SelectItem value="Reverse">Reverse</SelectItem>
                      <SelectItem value="Crypto">Crypto</SelectItem>
                      <SelectItem value="Forensics">Forensics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="xp">XP Total</Label>
                  <Input
                    id="xp"
                    type="number"
                    placeholder="50"
                    value={formData.xp}
                    onChange={(e) => setFormData({ ...formData, xp: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Upload de Arquivos */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste e solte ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Suporta: .ova, .vmdk, Dockerfile, docker-compose.yml, scripts
                </p>
                <Input
                  type="file"
                  className="max-w-xs mx-auto"
                  onChange={(e) =>
                    setFormData({ ...formData, vmFile: e.target.files?.[0] || null })
                  }
                />
              </div>
              {formData.vmFile && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <Upload className="w-8 h-8 text-primary" />
                  <div className="flex-1">
                    <p className="font-medium">{formData.vmFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(formData.vmFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setFormData({ ...formData, vmFile: null })}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Configuração de Flags */}
          {step === 3 && (
            <div className="space-y-4">
              {formData.flags.map((flag, index) => (
                <div key={flag.id} className="p-4 rounded-lg bg-muted/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Flag {index + 1}</Label>
                    {formData.flags.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFlag(flag.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      placeholder="kryzon{example_flag}"
                      value={flag.value}
                      onChange={(e) => {
                        const newFlags = formData.flags.map((f) =>
                          f.id === flag.id ? { ...f, value: e.target.value } : f
                        );
                        setFormData({ ...formData, flags: newFlags });
                      }}
                    />
                    <Input
                      type="number"
                      placeholder="Pontos"
                      value={flag.points}
                      onChange={(e) => {
                        const newFlags = formData.flags.map((f) =>
                          f.id === flag.id ? { ...f, points: e.target.value } : f
                        );
                        setFormData({ ...formData, flags: newFlags });
                      }}
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" onClick={addFlag} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Flag
              </Button>
            </div>
          )}

          {/* Step 4: Recursos e Anexos */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="hints">Dicas (Opcional)</Label>
                <Textarea
                  id="hints"
                  placeholder="Forneça dicas para os participantes..."
                  rows={4}
                  value={formData.hints}
                  onChange={(e) => setFormData({ ...formData, hints: e.target.value })}
                />
              </div>
              <div>
                <Label>Anexos Adicionais</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    multiple
                    className="max-w-xs mx-auto"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        attachments: Array.from(e.target.files || []),
                      })
                    }
                  />
                </div>
                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded bg-muted/50"
                      >
                        <span className="text-sm flex-1">{file.name}</span>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Preview */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-semibold mb-2">{formData.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{formData.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="outline" className="border-primary text-primary">
                    {formData.difficulty}
                  </Badge>
                  <Badge variant="outline">{formData.category}</Badge>
                  <Badge variant="outline">{formData.xp} XP</Badge>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm font-medium mb-2">Flags: {formData.flags.length}</p>
                <p className="text-sm font-medium">
                  Anexos: {formData.vmFile ? 1 : 0} + {formData.attachments.length}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-border">
            <Button variant="outline" onClick={handleBack} disabled={step === 1}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Anterior
            </Button>
            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>Enviar para Revisão</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
