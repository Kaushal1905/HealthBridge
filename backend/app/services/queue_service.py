queue_list = []
token_counter = 1


def add_patient_to_queue(patient_id, name, priority="normal"):
    global token_counter
    patient = {
        "token": token_counter,
        "patient_id": patient_id,
        "name": name,
        "priority": priority,
    }
    queue_list.append(patient)
    token_counter += 1
    _sort_queue()
    return patient


def _sort_queue():
    priority_order = {"emergency": 0, "normal": 1}
    queue_list.sort(key=lambda x: priority_order.get(x["priority"], 1))


def get_queue():
    return queue_list


def next_patient():
    if not queue_list:
        return None
    return queue_list.pop(0)
