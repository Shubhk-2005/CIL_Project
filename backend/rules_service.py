import time
from typing import Dict, Any, List

class RulesService:
    def __init__(self):
        self.tree_structure = {
            "root": "dyspnea",
            "nodes": {
                "dyspnea": {
                    "id": "dyspnea",
                    "label": "Dyspnea (Shortness of Breath)",
                    "type": "decision",
                    "options": ["yes", "no"],
                    "branches": {
                        "yes": {"target": "pneumonia_leaf", "label": "= yes"},
                        "no": {"target": "polyuria", "label": "= no"}
                    }
                },
                "polyuria": {
                    "id": "polyuria",
                    "label": "Polyuria (Frequent Urination)",
                    "type": "decision",
                    "options": ["yes", "no"],
                    "branches": {
                        "yes": {"target": "diabetes_leaf", "label": "= yes"},
                        "no": {"target": "RT_PCR", "label": "= no"}
                    }
                },
                "RT_PCR": {
                    "id": "RT_PCR",
                    "label": "RT-PCR Viral Test",
                    "type": "decision",
                    "options": ["positive", "negative", "not_done"],
                    "branches": {
                        "positive": {"target": "covid19_leaf", "label": "= positive"},
                        "negative": {"target": "none_leaf", "label": "= negative"},
                        "not_done": {"target": "skin_lesion", "label": "= not_done"}
                    }
                },
                "skin_lesion": {
                    "id": "skin_lesion",
                    "label": "Cutaneous / Skin Lesion",
                    "type": "decision",
                    "options": ["yes", "no"],
                    "branches": {
                        "yes": {"target": "skin_condition_leaf", "label": "= yes"},
                        "no": {"target": "hypertension_leaf", "label": "= no"}
                    }
                },
                "pneumonia_leaf": {
                    "id": "pneumonia_leaf",
                    "disease": "Pneumonia",
                    "type": "leaf",
                    "support": 5.0,
                    "confidence": 1.0,
                    "color": "#ef4444",
                    "severity": "High / Respiratory Emergency"
                },
                "diabetes_leaf": {
                    "id": "diabetes_leaf",
                    "disease": "Diabetes",
                    "type": "leaf",
                    "support": 5.0,
                    "confidence": 1.0,
                    "color": "#f59e0b",
                    "severity": "Moderate / Endocrine Metabolic"
                },
                "covid19_leaf": {
                    "id": "covid19_leaf",
                    "disease": "COVID-19",
                    "type": "leaf",
                    "support": 5.0,
                    "confidence": 1.0,
                    "color": "#8b5cf6",
                    "severity": "High / Viral Isolation Protocol"
                },
                "none_leaf": {
                    "id": "none_leaf",
                    "disease": "None / Healthy",
                    "type": "leaf",
                    "support": 5.0,
                    "confidence": 1.0,
                    "color": "#10b981",
                    "severity": "Normal / No Acute Finding"
                },
                "skin_condition_leaf": {
                    "id": "skin_condition_leaf",
                    "disease": "Skin Condition (Dermatosis)",
                    "type": "leaf",
                    "support": 5.0,
                    "confidence": 1.0,
                    "color": "#ec4899",
                    "severity": "Mild-Moderate / Dermatology Referral"
                },
                "hypertension_leaf": {
                    "id": "hypertension_leaf",
                    "disease": "Hypertension",
                    "type": "leaf",
                    "support": 5.0,
                    "confidence": 1.0,
                    "color": "#3b82f6",
                    "severity": "Moderate / Cardiovascular Monitoring"
                }
            }
        }

        self.presets = {
            "respiratory_dyspnea": {
                "name": "Case 1: Dyspnea Emergency",
                "dyspnea": "yes",
                "polyuria": "no",
                "RT_PCR": "not_done",
                "skin_lesion": "no",
                "expected": "Pneumonia"
            },
            "polyuria_metabolic": {
                "name": "Case 2: Polyuria Metabolic",
                "dyspnea": "no",
                "polyuria": "yes",
                "RT_PCR": "not_done",
                "skin_lesion": "no",
                "expected": "Diabetes"
            },
            "covid_positive": {
                "name": "Case 3: Positive RT-PCR",
                "dyspnea": "no",
                "polyuria": "no",
                "RT_PCR": "positive",
                "skin_lesion": "no",
                "expected": "COVID-19"
            },
            "negative_screening": {
                "name": "Case 4: Negative RT-PCR Screening",
                "dyspnea": "no",
                "polyuria": "no",
                "RT_PCR": "negative",
                "skin_lesion": "no",
                "expected": "None / Healthy"
            },
            "dermatology_lesion": {
                "name": "Case 5: Skin Lesion Case",
                "dyspnea": "no",
                "polyuria": "no",
                "RT_PCR": "not_done",
                "skin_lesion": "yes",
                "expected": "Skin Condition"
            },
            "hypertension_default": {
                "name": "Case 6: Cardiovascular Baseline",
                "dyspnea": "no",
                "polyuria": "no",
                "RT_PCR": "not_done",
                "skin_lesion": "no",
                "expected": "Hypertension"
            }
        }

    def get_tree_metadata(self) -> Dict[str, Any]:
        return {
            "algorithm": "J48 (C4.5 Weka Implementation)",
            "source_image": "j48.png",
            "tree": self.tree_structure,
            "presets": self.presets,
            "parameters": [
                {
                    "id": "dyspnea",
                    "name": "Dyspnea",
                    "description": "Acute or progressive difficulty breathing / shortness of breath",
                    "options": [
                        {"value": "yes", "label": "Yes (Present)"},
                        {"value": "no", "label": "No (Absent)"}
                    ]
                },
                {
                    "id": "polyuria",
                    "name": "Polyuria",
                    "description": "Abnormally large volumes of dilute urine production",
                    "options": [
                        {"value": "yes", "label": "Yes (Present)"},
                        {"value": "no", "label": "No (Absent)"}
                    ]
                },
                {
                    "id": "RT_PCR",
                    "name": "RT-PCR Test",
                    "description": "Reverse transcription-polymerase chain reaction test status",
                    "options": [
                        {"value": "positive", "label": "Positive"},
                        {"value": "negative", "label": "Negative"},
                        {"value": "not_done", "label": "Not Done"}
                    ]
                },
                {
                    "id": "skin_lesion",
                    "name": "Skin Lesion",
                    "description": "Visible cut, rash, papule, ulcer, or dermatological lesion",
                    "options": [
                        {"value": "yes", "label": "Yes (Present)"},
                        {"value": "no", "label": "No (Absent)"}
                    ]
                }
            ]
        }

    def evaluate(self, dyspnea: str = "no", polyuria: str = "no", RT_PCR: str = "not_done", skin_lesion: str = "no") -> Dict[str, Any]:
        start_time = time.time()
        
        inputs = {
            "dyspnea": dyspnea.lower().strip(),
            "polyuria": polyuria.lower().strip(),
            "RT_PCR": RT_PCR.lower().strip(),
            "skin_lesion": skin_lesion.lower().strip()
        }

        active_path_nodes = []
        active_path_edges = []
        steps = []
        rule_conditions = []

        curr_node = "dyspnea"
        active_path_nodes.append(curr_node)
        val = inputs.get("dyspnea", "no")
        rule_conditions.append(f"dyspnea == '{val}'")
        
        if val == "yes":
            edge = f"{curr_node}->yes"
            active_path_edges.append(edge)
            leaf = "pneumonia_leaf"
            active_path_nodes.append(leaf)
            steps.append({
                "step": 1,
                "node": "dyspnea",
                "condition": "dyspnea = 'yes'",
                "result": "Branch to Pneumonia Leaf",
                "explanation": "Shortness of breath indicates primary acute pulmonary distress."
            })
            target_leaf = self.tree_structure["nodes"][leaf]
        else:
            edge = f"{curr_node}->no"
            active_path_edges.append(edge)
            steps.append({
                "step": 1,
                "node": "dyspnea",
                "condition": "dyspnea = 'no'",
                "result": "Branch to Polyuria Evaluation",
                "explanation": "No dyspnea detected; continuing triage to metabolic markers."
            })
            
            curr_node = "polyuria"
            active_path_nodes.append(curr_node)
            val = inputs.get("polyuria", "no")
            rule_conditions.append(f"polyuria == '{val}'")
            
            if val == "yes":
                edge = f"{curr_node}->yes"
                active_path_edges.append(edge)
                leaf = "diabetes_leaf"
                active_path_nodes.append(leaf)
                steps.append({
                    "step": 2,
                    "node": "polyuria",
                    "condition": "polyuria = 'yes'",
                    "result": "Branch to Diabetes Leaf",
                    "explanation": "Osmotic diuresis detected without dyspnea strongly points to diabetes mellitus."
                })
                target_leaf = self.tree_structure["nodes"][leaf]
            else:
                edge = f"{curr_node}->no"
                active_path_edges.append(edge)
                steps.append({
                    "step": 2,
                    "node": "polyuria",
                    "condition": "polyuria = 'no'",
                    "result": "Branch to RT-PCR Evaluation",
                    "explanation": "No polyuria; checking viral molecular diagnostic status."
                })
                
                curr_node = "RT_PCR"
                active_path_nodes.append(curr_node)
                val = inputs.get("RT_PCR", "not_done")
                rule_conditions.append(f"RT_PCR == '{val}'")
                
                if val == "positive":
                    edge = f"{curr_node}->positive"
                    active_path_edges.append(edge)
                    leaf = "covid19_leaf"
                    active_path_nodes.append(leaf)
                    steps.append({
                        "step": 3,
                        "node": "RT_PCR",
                        "condition": "RT_PCR = 'positive'",
                        "result": "Branch to COVID-19 Leaf",
                        "explanation": "Confirmed viral genomic amplification via RT-PCR confirms COVID-19."
                    })
                    target_leaf = self.tree_structure["nodes"][leaf]
                elif val == "negative":
                    edge = f"{curr_node}->negative"
                    active_path_edges.append(edge)
                    leaf = "none_leaf"
                    active_path_nodes.append(leaf)
                    steps.append({
                        "step": 3,
                        "node": "RT_PCR",
                        "condition": "RT_PCR = 'negative'",
                        "result": "Branch to None (Healthy) Leaf",
                        "explanation": "Negative viral screening with absence of dyspnea and polyuria indicates no acute condition."
                    })
                    target_leaf = self.tree_structure["nodes"][leaf]
                else:
                    edge = f"{curr_node}->not_done"
                    active_path_edges.append(edge)
                    steps.append({
                        "step": 3,
                        "node": "RT_PCR",
                        "condition": "RT_PCR = 'not_done'",
                        "result": "Branch to Skin Lesion Evaluation",
                        "explanation": "No RT-PCR on record; proceeding to dermatological inspection."
                    })
                    
                    curr_node = "skin_lesion"
                    active_path_nodes.append(curr_node)
                    val = inputs.get("skin_lesion", "no")
                    rule_conditions.append(f"skin_lesion == '{val}'")
                    
                    if val == "yes":
                        edge = f"{curr_node}->yes"
                        active_path_edges.append(edge)
                        leaf = "skin_condition_leaf"
                        active_path_nodes.append(leaf)
                        steps.append({
                            "step": 4,
                            "node": "skin_lesion",
                            "condition": "skin_lesion = 'yes'",
                            "result": "Branch to Skin Condition Leaf",
                            "explanation": "Visible skin lesion observed in absence of respiratory/metabolic markers."
                        })
                        target_leaf = self.tree_structure["nodes"][leaf]
                    else:
                        edge = f"{curr_node}->no"
                        active_path_edges.append(edge)
                        leaf = "hypertension_leaf"
                        active_path_nodes.append(leaf)
                        steps.append({
                            "step": 4,
                            "node": "skin_lesion",
                            "condition": "skin_lesion = 'no'",
                            "result": "Branch to Hypertension Leaf",
                            "explanation": "Exclusion of acute respiratory, diabetic, viral, and skin signs assigns baseline cardiovascular triage."
                        })
                        target_leaf = self.tree_structure["nodes"][leaf]

        latency = round((time.time() - start_time) * 1000, 3)
        rule_str = "IF " + " AND ".join(rule_conditions) + f" THEN Diagnosis = '{target_leaf['disease']}'"

        return {
            "diagnosis": target_leaf["disease"],
            "leaf_id": target_leaf["id"],
            "support": target_leaf["support"],
            "confidence_percent": 100.0,
            "severity": target_leaf["severity"],
            "badge_color": target_leaf["color"],
            "rule_expression": rule_str,
            "steps": steps,
            "active_nodes": active_path_nodes,
            "active_edges": active_path_edges,
            "inputs_evaluated": inputs,
            "latency_ms": latency,
            "algorithm": "J48 / C4.5 Decision Tree Classifier"
        }
