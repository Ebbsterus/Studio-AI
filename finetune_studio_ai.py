"""
Studio AI Chatbot — Fine-tune (pure HuggingFace/PEFT/TRL, no Unsloth/Triton)
Base model: Qwen/Qwen2.5-1.5B-Instruct
Method: QLoRA 4-bit, LoRA rank 16
Output: merged safetensors → convert to GGUF with llama.cpp after this script
"""

import os, json, torch
from datasets import Dataset
from transformers import AutoModelForCausalLM, AutoTokenizer
from peft import LoraConfig, get_peft_model
from trl import SFTTrainer, SFTConfig

BASE_MODEL  = "/home/ebbsterus/models/qwen-1.5b"  # local copy, avoids HF cache issues
DATA_FILE   = "/home/ebbsterus/training/studio_ai_training_data.jsonl"
OUTPUT_DIR  = "/home/ebbsterus/models/studio-ai-chatbot"
LORA_RANK   = 16
EPOCHS      = 3
BATCH_SIZE  = 4
MAX_SEQ_LEN = 2048

# ── Tokenizer ─────────────────────────────────────────────────────────────────
print("Loading tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, trust_remote_code=True)
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

# ── Model (bf16 — GB10 has 128GB unified RAM, no need for quantization) ───────
print("Loading base model (bf16)...")
model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    dtype=torch.bfloat16,
    device_map="auto",
    attn_implementation="eager",
)
model.gradient_checkpointing_enable()

# ── LoRA ──────────────────────────────────────────────────────────────────────
print("Applying LoRA...")
lora_cfg = LoraConfig(
    r=LORA_RANK,
    lora_alpha=LORA_RANK,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj",
                    "gate_proj", "up_proj", "down_proj"],
    lora_dropout=0,
    bias="none",
    task_type="CAUSAL_LM",
)
model = get_peft_model(model, lora_cfg)
model.print_trainable_parameters()

# ── Dataset ───────────────────────────────────────────────────────────────────
print("Loading training data...")
records = []
with open(DATA_FILE) as f:
    for line in f:
        line = line.strip()
        if not line:
            continue
        ex = json.loads(line)
        messages = ex["conversations"]
        text = tokenizer.apply_chat_template(
            messages, tokenize=False, add_generation_prompt=False
        )
        records.append({"text": text})

dataset = Dataset.from_list(records)
print(f"Training on {len(dataset)} examples")

# ── Train ─────────────────────────────────────────────────────────────────────
print("Starting training...")
trainer = SFTTrainer(
    model=model,
    processing_class=tokenizer,
    train_dataset=dataset,
    args=SFTConfig(
        output_dir=OUTPUT_DIR + "-checkpoints",
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        gradient_accumulation_steps=4,
        warmup_steps=10,
        learning_rate=2e-4,
        bf16=True,
        logging_steps=5,
        save_strategy="no",
        optim="adamw_torch",
        weight_decay=0.01,
        lr_scheduler_type="cosine",
        seed=42,
        max_length=MAX_SEQ_LEN,
        dataset_text_field="text",
        report_to="none",
    ),
)
trainer.train()
print("Training complete.")

# ── Merge & save ──────────────────────────────────────────────────────────────
print("Merging LoRA weights and saving...")
os.makedirs(OUTPUT_DIR, exist_ok=True)
merged = trainer.model.merge_and_unload()
merged.save_pretrained(OUTPUT_DIR, safe_serialization=True)
tokenizer.save_pretrained(OUTPUT_DIR)
print(f"Merged model saved to {OUTPUT_DIR}")
print()
print("Next steps:")
print("  1. Install llama.cpp:")
print("     git clone https://github.com/ggerganov/llama.cpp ~/llama.cpp")
print("     pip install -r ~/llama.cpp/requirements.txt")
print("  2. Convert to GGUF Q4_K_M:")
print("     python ~/llama.cpp/convert_hf_to_gguf.py \\")
print("       /home/ebbsterus/models/studio-ai-chatbot \\")
print("       --outfile /home/ebbsterus/models/studio-ai-chatbot-gguf/model-q4.gguf \\")
print("       --outtype q4_0")
print("  3. Create Ollama model:")
print("     ollama create studio-ai -f /home/ebbsterus/models/studio-ai-chatbot-gguf/Modelfile")
